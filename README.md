LocalVideoEffector
====

LocalVideoEffector is the library to apply effects to the video image in real time.

## Description
This package enable your webpage to apply effects to images captured by camera device in real time. For example virtual background.

### Features

- Virtual Background
- (not yet)

## Demo
https://virtual-background-bodypix.herokuapp.com/index.html

### Demo source code


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

Drawing. doEffect accepts the resolution in which this libary apply the effects. So, output image size is the same as this parametar. And the performance depends on this parameter.

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
