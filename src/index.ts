import * as BodyPix from '@tensorflow-models/body-pix';
import { ModelConfig } from '@tensorflow-models/body-pix/dist/body_pix_model';

const cv_asm = require('../resources/opencv.js');
let init_cv = false

cv_asm.onRuntimeInitialized = function () {
    console.log("initialized cv_asm")
    init_cv = true
  }

/**
 * @param kind 
 */
export const getDeviceLists = async () =>{
  const list = await navigator.mediaDevices.enumerateDevices()
  console.log("GET_DEVICE_LIST", list)

  const audioInputDevices = list.filter((x:InputDeviceInfo | MediaDeviceInfo)=>{
      return x.kind === "audioinput"
  })
  const videoInputDevices = list.filter((x:InputDeviceInfo | MediaDeviceInfo)=>{
      return x.kind === "videoinput"
  })
  const audioOutputDevices = list.filter((x:InputDeviceInfo | MediaDeviceInfo)=>{
      return x.kind === "audiooutput"
  })
  const videoInputResolutions = [
      {deviceId: "360p", groupId: "360p", kind: "videoinputres", label: "360p"},
      {deviceId: "540p", groupId: "540p", kind: "videoinputres", label: "540p"},
      {deviceId: "720p", groupId: "720p", kind: "videoinputres", label: "720p"},
  ]
  return{
      audioinput    : audioInputDevices,
      videoinput    : videoInputDevices,
      audiooutput   : audioOutputDevices,
      videoinputres : videoInputResolutions,
  }
}

export const getVideoDevice = async (deviceId:string): Promise<MediaStream|null>=>{

  const webCamPromise = navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { deviceId: deviceId,
          width: { ideal: 1280 },
          height: { ideal: 720 }
      }
  })
  return webCamPromise
}

export const ModelConfigResNet: ModelConfig = {
    architecture: 'ResNet50',
    outputStride: 32,
    quantBytes: 2
}
export const ModelConfigMobileNetV1: ModelConfig = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2
}

export class LocalVideoEffectors{
    private deviceId:string=""
    private inputVideoStream:MediaStream | null = null
    private inputVideoElement = document.createElement("video")
    private inputMaskCanvas   = document.createElement("canvas")
    private virtualBGImage    = document.createElement("img")
    private virtualBGCanvas   = document.createElement("canvas")
    
    private inputVideoCanvas2 = document.createElement("canvas")

    private _cameraEnabled:boolean              = true
    private _virtualBackgroundEnabled:boolean   = false
    private _virtualBackgroundImagePath         = "/resources/vbg/pic0.jpg"
    private bodyPix:BodyPix.BodyPix|null        = null
    private _maskBlurAmount                     = 2

    private _canny:boolean                      = false

    set cameraEnabled(val:boolean){this._cameraEnabled=val}
    set virtualBackgroundEnabled(val:boolean){this._virtualBackgroundEnabled=val}
    set virtualBackgroundImagePath(val:string){this._virtualBackgroundImagePath=val}
    set maskBlurAmount(val:number){this._maskBlurAmount=val}
    set canny(val:boolean){this._canny=val}

    get outputWidth():number{return this.inputVideoCanvas2.width}
    get outputHeight():number{return this.inputVideoCanvas2.height}
    get outputCanvas():HTMLCanvasElement{return this.inputVideoCanvas2}

    constructor(config:ModelConfig|null){
        if(config == null){
            BodyPix.load().then((bodyPix)=>{
                this.bodyPix = bodyPix
            })
        }else{
            BodyPix.load(config).then((bodyPix)=>{
                this.bodyPix = bodyPix
            })
        }
    }

    selectInputVideoDevice = async(deviceId:string) =>{
        this.inputVideoStream?.getTracks().map(s=>s.stop())
        this.deviceId=deviceId
        getVideoDevice(deviceId).then(stream => {
            if (stream !== null) {
                this.inputVideoElement!.srcObject = stream
                this.inputVideoElement!.play()
                this.inputVideoStream = stream
                return new Promise((resolve, reject) => {
                    this.inputVideoElement!.onloadedmetadata = () => {
                        resolve();
                    };
                });
            }
        }).catch((e) => {
            console.log("DEVICE:error:", e)
            throw new Error("DEVICE:error: "+e)
        });
    }

    setMediaStream = async(stream:MediaStream) =>{
        this.inputVideoStream?.getTracks().map(s=>s.stop())

        this.inputVideoElement!.srcObject = stream
        this.inputVideoElement!.loop = true
        this.inputVideoElement!.play()
        this.inputVideoStream = stream
        return new Promise((resolve, reject) => {
            this.inputVideoElement!.onloadedmetadata = () => {
                resolve();
            };
        });
    }

    stopInputMediaStream = () =>{
        this.inputVideoStream?.getVideoTracks()[0].stop()
    } 

    getMediaStream = ():MediaStream =>{
        // @ts-ignore
        return this.inputVideoCanvas2.captureStream()
    }

    doEffect = (width:number, height:number) =>{
        if (this._cameraEnabled === false) {
            const ctx = this.inputVideoCanvas2.getContext("2d")!
            this.inputVideoCanvas2.width = 6
            this.inputVideoCanvas2.height = 4
            ctx.fillStyle = "grey"
            ctx.fillRect(0, 0, this.inputVideoCanvas2.width, this.inputVideoCanvas2.height)
        } else if (this.inputVideoStream !== null && this._virtualBackgroundEnabled === false) {
            const ctx = this.inputVideoCanvas2.getContext("2d")!
            const inputVideoCanvas2 = this.inputVideoCanvas2
            const outputWidth = this.inputVideoStream?.getTracks()[0].getSettings().width!
            const outputHeight = this.inputVideoStream?.getTracks()[0].getSettings().height!
            // inputVideoCanvas2.width  = LocalVideoConfigs[this.outputResolutionKey].width
            inputVideoCanvas2.width  = width
            inputVideoCanvas2.height = (inputVideoCanvas2.width/outputWidth) * outputHeight
            ctx.drawImage(this.inputVideoElement, 0, 0, inputVideoCanvas2.width, inputVideoCanvas2.height)
        } else if (this.inputVideoStream !== null && this._virtualBackgroundEnabled === true && this.bodyPix !== null){
            //// (1) Generate input image for segmentation.
            const outputWidth       = this.inputVideoStream?.getTracks()[0].getSettings().width!
            const outputHeight      = this.inputVideoStream?.getTracks()[0].getSettings().height!
            const canvas            = document.createElement("canvas")
            canvas.width            = width
//            canvas.width            = LocalVideoConfigs[this.outputResolutionKey].width
            canvas.height           = (canvas.width/outputWidth) * outputHeight
            const ctx = canvas.getContext("2d")!
            ctx.drawImage(this.inputVideoElement, 0, 0, canvas.width, canvas.height)

            //// (2) Segmentation & Mask
            //// (2-1) Segmentation.
            this.bodyPix.segmentPerson(canvas).then((segmentation) => {
                //// (2-2) Generate mask
                const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
                const backgroundColor = { r: 255, g: 255, b: 255, a: 255 };
                const backgroundMask = BodyPix.toMask(segmentation, foregroundColor, backgroundColor);
                const opacity = 1.0;
                const maskBlurAmount = this._maskBlurAmount;
                const flipHorizontal = false;
                BodyPix.drawMask(this.inputMaskCanvas, canvas, backgroundMask, opacity, maskBlurAmount, flipHorizontal);
                if(init_cv === true){
                    // let src = cv_asm.imread(canvas);
                    // let dst = new cv_asm.Mat();
                    // cv_asm.cvtColor(src, src, cv_asm.COLOR_RGBA2GRAY, 0);
                    // // You can try more different parameters
                    // cv_asm.adaptiveThreshold(src, dst, 200, cv_asm.ADAPTIVE_THRESH_GAUSSIAN_C, cv_asm.THRESH_BINARY, 3, 2);
                    // cv_asm.imshow(canvas, dst);
                    // src.delete();
                    // dst.delete();

                    // let src = cv_asm.imread(canvas);
                    // let equalDst = new cv_asm.Mat();
                    // let claheDst = new cv_asm.Mat();
                    // cv_asm.cvtColor(src, src, cv_asm.COLOR_RGBA2GRAY, 0);
                    // cv_asm.equalizeHist(src, equalDst);
                    // let tileGridSize = new cv_asm.Size(18, 18);
                    // // You can try more different parameters
                    // let clahe = new cv_asm.CLAHE(40, tileGridSize);
                    // clahe.apply(src, claheDst);
                    // //cv_asm.imshow(canvas, equalDst);
                    // cv_asm.imshow(canvas, claheDst);
                    // src.delete(); equalDst.delete(); claheDst.delete(); clahe.delete();
                    
                    if(this._canny){
                        let src = cv_asm.imread(canvas);
                        let dst = new cv_asm.Mat();
                        cv_asm.cvtColor(src, src, cv_asm.COLOR_RGB2GRAY, 0);
                        // You can try more different parameters
                        cv_asm.Canny(src, dst, 100, 80, 3, false);
                        cv_asm.imshow(canvas, dst);
                        src.delete(); dst.delete();
                    }
                }
                const maskedImage = this.inputMaskCanvas.getContext("2d")!.getImageData(0, 0, this.inputMaskCanvas.width, this.inputMaskCanvas.height)
                //// (2-3) Generate background Image
                this.virtualBGImage.src  = this._virtualBackgroundImagePath
                this.virtualBGCanvas.width  = maskedImage.width
                this.virtualBGCanvas.height = maskedImage.height
                const ctx = this.virtualBGCanvas.getContext("2d")!
                ctx.drawImage(this.virtualBGImage, 0, 0, this.virtualBGCanvas.width, this.virtualBGCanvas.height)
                const bgImageData = ctx.getImageData(0, 0, this.virtualBGCanvas.width, this.virtualBGCanvas.height)
                //// (2-4) merge background and mask
                const pixelData = new Uint8ClampedArray(maskedImage.width * maskedImage.height * 4)
                const fgImageData = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height)
                for (let rowIndex = 0; rowIndex < maskedImage.height; rowIndex++) {
                    for (let colIndex = 0; colIndex < maskedImage.width; colIndex++) {
                        const pix_offset = ((rowIndex * maskedImage.width) + colIndex) * 4
                        if (maskedImage.data[pix_offset] === 255 &&
                            maskedImage.data[pix_offset + 1] === 255 &&
                            maskedImage.data[pix_offset + 2] === 255 &&
                            maskedImage.data[pix_offset + 3] === 255
                        ) {
                            pixelData[pix_offset] = bgImageData.data[pix_offset]
                            pixelData[pix_offset + 1] = bgImageData.data[pix_offset + 1]
                            pixelData[pix_offset + 2] = bgImageData.data[pix_offset + 2]
                            pixelData[pix_offset + 3] = bgImageData.data[pix_offset + 3]
                        } else {
                            pixelData[pix_offset]     = fgImageData.data[pix_offset]
                            pixelData[pix_offset + 1] = fgImageData.data[pix_offset + 1]
                            pixelData[pix_offset + 2] = fgImageData.data[pix_offset + 2]
                            pixelData[pix_offset + 3] = fgImageData.data[pix_offset + 3]
                        }
                    }
                }
                const imageData = new ImageData(pixelData, maskedImage.width, maskedImage.height);

                //// (2-5) output
                const inputVideoCanvas2   = this.inputVideoCanvas2
                inputVideoCanvas2.width   = imageData.width
                inputVideoCanvas2.height  = imageData.height
                inputVideoCanvas2.getContext("2d")!.putImageData(imageData, 0, 0)

            })
        }else{
            // console.log("no video effecting1.")
            // console.log("no video effecting2." , this.inputVideoStream)
            // console.log("no video effecting3." , this.virtualBackgroundEnabled)
            // console.log("no video effecting4." , this.bodyPix)
        }
    }

}