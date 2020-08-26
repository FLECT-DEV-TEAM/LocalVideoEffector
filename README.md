LocalVideoEffector
====

LocalVideoEffector is the library to apply effects to the video image in real time.

## Description
This package enable your webpage to apply effects to images captured by camera device in real time. For example virtual background.

<p align="center">
<img src="./doc/demo_basic.gif" width="480" />
</p>

### Features

- Virtual Background
- Share screen as virtual background
- Share movie as virtual background
- (not yet)

## Demo
https://flect-lab-web.s3-us-west-2.amazonaws.com/001_virtual_background/index.html

### Demo source code
https://github.com/dannadori/virtual-background-demo

## Requirement
This library is tested only with react.

## Usage
### Sample Code

```
import * as React from 'react';
import { LocalVideoEffectors } from 'local-video-effector'
/**
 * Main Component
 */
class App extends React.Component {
  localCanvasRef = React.createRef<HTMLCanvasElement>()
  localVideoEffectors = new LocalVideoEffectors(null)
  componentDidMount() {
    this.localVideoEffectors.cameraEnabled = true
    this.localVideoEffectors.virtualBackgroundEnabled = true
    this.localVideoEffectors.virtualBackgroundImagePath = "/resources/vbg/pic1.jpg"
    this.localVideoEffectors.selectInputVideoDevice("").then(() => {
      requestAnimationFrame(() => this.drawVideoCanvas())
    })
  }

  drawVideoCanvas = () => {
    this.localVideoEffectors.doEffect(960,640)
    if (this.localCanvasRef.current !== null) {
      if (this.localVideoEffectors.outputWidth !== 0 && this.localVideoEffectors.outputHeight !== 0) {
        this.localCanvasRef.current.height = (this.localCanvasRef.current.width / this.localVideoEffectors.outputWidth) * this.localVideoEffectors.outputHeight
        const ctx = this.localCanvasRef.current.getContext("2d")!
        ctx.drawImage(this.localVideoEffectors.outputCanvas, 0, 0, this.localCanvasRef.current.width, this.localCanvasRef.current.height)
      }
    }
    requestAnimationFrame(() => this.drawVideoCanvas())
  }


  render() {
    return (
      <div style={{ width: "100%", margin: "auto" }}>
        <canvas ref={this.localCanvasRef}  style={{ display: "block", width: "100%", margin: "auto" }} />
      </div>
    )
  }
}


export default App;
```
### constructor
You should instansiate LocalVideoEffectors.

```
localVideoEffectors = new LocalVideoEffectors(null)
```

### componentDidMount
You shuold configure the instance.
```
    this.localVideoEffectors.cameraEnabled = true
    this.localVideoEffectors.virtualBackgroundEnabled = true
    this.localVideoEffectors.virtualBackgroundImagePath = "/resources/vbg/pic1.jpg"
```


Select camera device. If you input empty string as parameter, default camera is selected.
then draw image.
```
    this.localVideoEffectors.selectInputVideoDevice("").then(() => {
      requestAnimationFrame(() => this.drawVideoCanvas())
    })
```

Drawing. doEffect accepts the resolution in which this libary apply the effects. So, output image size is the same as this parametar. And the performance depends on this parameter. Output frame size is the same size as background image. If you chnage the size, you can pass the 3rd and 4th parameters as width and height.

```
  drawVideoCanvas = () => {
    this.localVideoEffectors.doEffect(960,640)
    if (this.localCanvasRef.current !== null) {
      if (this.localVideoEffectors.outputWidth !== 0 && this.localVideoEffectors.outputHeight !== 0) {
        this.localCanvasRef.current.height = (this.localCanvasRef.current.width / this.localVideoEffectors.outputWidth) * this.localVideoEffectors.outputHeight
        const ctx = this.localCanvasRef.current.getContext("2d")!
        ctx.drawImage(this.localVideoEffectors.outputCanvas, 0, 0, this.localCanvasRef.current.width, this.localCanvasRef.current.height)
      }
    }
    requestAnimationFrame(() => this.drawVideoCanvas())
  }
```

### Advanced
#### Blur
You can change blur with maskBlurAmount

```
this.localVideoEffectors.maskBlurAmount             = blur
```

https://virtual-background-bodypix.herokuapp.com/index.html?blur=2

#### Model
You can chnage model with constructor.
Acceptable parameter is "null", "ModelConfigMobileNetV1", "ModelConfigResNet"
```
this.localVideoEffectors = new LocalVideoEffectors(ModelConfigMobileNetV1)
```
- ModelConfigResNet
https://virtual-background-bodypix.herokuapp.com/index.html?blur=0&model=ResNet

- ModelConfigMobileNetV1
https://virtual-background-bodypix.herokuapp.com/index.html?blur=0&model=MobileNetV1

#### Sharing screen or movie as virtual background
This package have the function to use the mediastream as virtual background. You can set the Mediastrem as below example. 

This example shows the how to change the virtual background. These function is called by your UI button such as onClick or so.

```

  setBGImage = () => {
    this.localVideoEffectors!.virtualBackgroundImageElement = this.virtualBGImage
    this.setState({foregroundSizeChange: false})
    this.shareVideoElementRef.current!.pause()
  }

  // For SharedDisplay
  sharedDisplaySelected = () => {
    const streamConstraints = {
        // frameRate: {
        //     max: 15,
        // },
    }
    // @ts-ignore https://github.com/microsoft/TypeScript/issues/31821
    navigator.mediaDevices.getDisplayMedia().then(media => {
      this.localVideoEffectors!.virtualBackgroundStream = media
      this.setState({foregroundSizeChange: true})
      this.shareVideoElementRef.current!.pause()
    })
  }

  // For SharedVideo
  sharedVideoSelected = (e: any) => {
    const path = URL.createObjectURL(e.target.files[0]);
    console.log(path)
    this.shareVideoElementRef.current!.src = path
    this.shareVideoElementRef.current!.play()

    setTimeout(
      async () => {
          // @ts-ignore
          const mediaStream: MediaStream = await this.shareVideoElementRef.current!.captureStream()
          this.localVideoEffectors!.virtualBackgroundStream = mediaStream
          this.setState({foregroundSizeChange: true})
        }
      , 3000); // I don't know but we need some seconds to restart video share....
  }

```

#### Virtual Foreground
You can use mask to hide user face by line drawing or ascii art.

<p align="center">
<img src="./doc/demo_vfg.gif" width="480" />
</p>


```
this.localVideoEffectors!.foregroundType = ForegroundType.Canny
```

or

```
this.localVideoEffectors!.foregroundType = ForegroundType.Ascii
```

### iPhone safari
If you use the safari on iPhone, your video element must be run by clicking start button. This means video element must be controllable from your code directory. This package provide the method to set the HTMLVideoElement you defined.

Usage example:
In this example, render method of ReactComponent return HTMLVideoElement and Button which sets the HTMLElement to the this package(LocalVideoEeffectors).

```
      return (
        <div style={{ width: "480px", margin: "auto" }}>
          <video ref={this.localVideoRef} style={{ display: "block", width: "480px", margin: "auto" }} playsInline />
          <canvas ref={this.localCanvasRef}  style={{ display: "block", width: "480px", margin: "auto" }} />
          <input type="button" value="start" onClick={(e)=>{
            navigator.mediaDevices.getUserMedia({              
              audio: false,
              video: { 
                // deviceId: deviceId,
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            }).then(stream => {
              if (stream !== null) {
                this.localVideoRef.current!.srcObject = stream
                this.localVideoRef.current!.play()
                return new Promise((resolve, reject) => {
                  this.localVideoRef.current!.onloadedmetadata = () => {
                    resolve();
                  };
                });
              }
            })
            this.localVideoEffectors!.setVideoElement(this.localVideoRef.current!)
          }}
          />
        </div>
      )
```

## Install

npm install local-video-effector

## Contribution

## Licence

Apache-2.0

## Author

Wataru Okada

- Medium: https://medium.com/@dannadori
- Qiita(Japanese): https://qiita.com/wok
