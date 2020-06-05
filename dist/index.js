var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as BodyPix from '@tensorflow-models/body-pix';
/**
 * @param kind
 */
export var getDeviceLists = function () { return __awaiter(void 0, void 0, void 0, function () {
    var list, audioInputDevices, videoInputDevices, audioOutputDevices, videoInputResolutions;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
            case 1:
                list = _a.sent();
                console.log("GET_DEVICE_LIST", list);
                audioInputDevices = list.filter(function (x) {
                    return x.kind === "audioinput";
                });
                videoInputDevices = list.filter(function (x) {
                    return x.kind === "videoinput";
                });
                audioOutputDevices = list.filter(function (x) {
                    return x.kind === "audiooutput";
                });
                videoInputResolutions = [
                    { deviceId: "360p", groupId: "360p", kind: "videoinputres", label: "360p" },
                    { deviceId: "540p", groupId: "540p", kind: "videoinputres", label: "540p" },
                    { deviceId: "720p", groupId: "720p", kind: "videoinputres", label: "720p" },
                ];
                return [2 /*return*/, {
                        audioinput: audioInputDevices,
                        videoinput: videoInputDevices,
                        audiooutput: audioOutputDevices,
                        videoinputres: videoInputResolutions,
                    }];
        }
    });
}); };
export var getVideoDevice = function (deviceId) { return __awaiter(void 0, void 0, void 0, function () {
    var webCamPromise;
    return __generator(this, function (_a) {
        webCamPromise = navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { deviceId: deviceId,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        return [2 /*return*/, webCamPromise];
    });
}); };
var LocalVideoEffectors = /** @class */ (function () {
    function LocalVideoEffectors() {
        var _this = this;
        this.deviceId = "";
        this.inputVideoStream = null;
        this.inputVideoElement = document.createElement("video");
        this.inputMaskCanvas = document.createElement("canvas");
        this.virtualBGImage = document.createElement("img");
        this.virtualBGCanvas = document.createElement("canvas");
        this.inputVideoCanvas2 = document.createElement("canvas");
        this._cameraEnabled = true;
        this._virtualBackgroundEnabled = false;
        this._virtualBackgroundImagePath = "/resources/vbg/pic0.jpg";
        this.bodyPix = null;
        this.selectInputVideoDevice = function (deviceId) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.deviceId = deviceId;
                getVideoDevice(deviceId).then(function (stream) {
                    if (stream !== null) {
                        _this.inputVideoElement.srcObject = stream;
                        _this.inputVideoElement.play();
                        _this.inputVideoStream = stream;
                        return new Promise(function (resolve, reject) {
                            _this.inputVideoElement.onloadedmetadata = function () {
                                resolve();
                            };
                        });
                    }
                }).catch(function (e) {
                    console.log("DEVICE:error:", e);
                });
                return [2 /*return*/];
            });
        }); };
        this.stopInputMediaStream = function () {
            var _a;
            (_a = _this.inputVideoStream) === null || _a === void 0 ? void 0 : _a.getVideoTracks()[0].stop();
        };
        this.getMediaStream = function () {
            // @ts-ignore
            return _this.inputVideoCanvas2.captureStream();
        };
        this.doEffect = function (width, height) {
            var _a, _b, _c, _d;
            if (_this._cameraEnabled === false) {
                var ctx = _this.inputVideoCanvas2.getContext("2d");
                _this.inputVideoCanvas2.width = 6;
                _this.inputVideoCanvas2.height = 4;
                ctx.fillStyle = "grey";
                ctx.fillRect(0, 0, _this.inputVideoCanvas2.width, _this.inputVideoCanvas2.height);
            }
            else if (_this.inputVideoStream !== null && _this._virtualBackgroundEnabled === false) {
                var ctx = _this.inputVideoCanvas2.getContext("2d");
                var inputVideoCanvas2 = _this.inputVideoCanvas2;
                var outputWidth = (_a = _this.inputVideoStream) === null || _a === void 0 ? void 0 : _a.getTracks()[0].getSettings().width;
                var outputHeight = (_b = _this.inputVideoStream) === null || _b === void 0 ? void 0 : _b.getTracks()[0].getSettings().height;
                // inputVideoCanvas2.width  = LocalVideoConfigs[this.outputResolutionKey].width
                inputVideoCanvas2.width = width;
                inputVideoCanvas2.height = (inputVideoCanvas2.width / outputWidth) * outputHeight;
                ctx.drawImage(_this.inputVideoElement, 0, 0, inputVideoCanvas2.width, inputVideoCanvas2.height);
            }
            else if (_this.inputVideoStream !== null && _this._virtualBackgroundEnabled === true && _this.bodyPix !== null) {
                //// (1) Generate input image for segmentation.
                var outputWidth = (_c = _this.inputVideoStream) === null || _c === void 0 ? void 0 : _c.getTracks()[0].getSettings().width;
                var outputHeight = (_d = _this.inputVideoStream) === null || _d === void 0 ? void 0 : _d.getTracks()[0].getSettings().height;
                var canvas_1 = document.createElement("canvas");
                canvas_1.width = width;
                //            canvas.width            = LocalVideoConfigs[this.outputResolutionKey].width
                canvas_1.height = (canvas_1.width / outputWidth) * outputHeight;
                var ctx = canvas_1.getContext("2d");
                ctx.drawImage(_this.inputVideoElement, 0, 0, canvas_1.width, canvas_1.height);
                //// (2) Segmentation & Mask
                //// (2-1) Segmentation.
                _this.bodyPix.segmentPerson(canvas_1).then(function (segmentation) {
                    //// (2-2) Generate mask
                    var foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
                    var backgroundColor = { r: 255, g: 255, b: 255, a: 255 };
                    var backgroundMask = BodyPix.toMask(segmentation, foregroundColor, backgroundColor);
                    var opacity = 1.0;
                    var maskBlurAmount = 2;
                    var flipHorizontal = false;
                    BodyPix.drawMask(_this.inputMaskCanvas, canvas_1, backgroundMask, opacity, maskBlurAmount, flipHorizontal);
                    var maskedImage = _this.inputMaskCanvas.getContext("2d").getImageData(0, 0, _this.inputMaskCanvas.width, _this.inputMaskCanvas.height);
                    //// (2-3) Generate background
                    var virtualBGImage = _this.virtualBGImage;
                    virtualBGImage.src = _this._virtualBackgroundImagePath;
                    var virtualBGCanvas = _this.virtualBGCanvas;
                    virtualBGCanvas.width = maskedImage.width;
                    virtualBGCanvas.height = maskedImage.height;
                    var ctx = _this.virtualBGCanvas.getContext("2d");
                    ctx.drawImage(_this.virtualBGImage, 0, 0, _this.virtualBGCanvas.width, _this.virtualBGCanvas.height);
                    var bgImageData = ctx.getImageData(0, 0, _this.virtualBGCanvas.width, _this.virtualBGCanvas.height);
                    //// (2-4) merge background and mask
                    var pixelData = new Uint8ClampedArray(maskedImage.width * maskedImage.height * 4);
                    for (var rowIndex = 0; rowIndex < maskedImage.height; rowIndex++) {
                        for (var colIndex = 0; colIndex < maskedImage.width; colIndex++) {
                            var pix_offset = ((rowIndex * maskedImage.width) + colIndex) * 4;
                            if (maskedImage.data[pix_offset] === 255 &&
                                maskedImage.data[pix_offset + 1] === 255 &&
                                maskedImage.data[pix_offset + 2] === 255 &&
                                maskedImage.data[pix_offset + 3] === 255) {
                                pixelData[pix_offset] = bgImageData.data[pix_offset];
                                pixelData[pix_offset + 1] = bgImageData.data[pix_offset + 1];
                                pixelData[pix_offset + 2] = bgImageData.data[pix_offset + 2];
                                pixelData[pix_offset + 3] = bgImageData.data[pix_offset + 3];
                            }
                            else {
                                pixelData[pix_offset] = maskedImage.data[pix_offset];
                                pixelData[pix_offset + 1] = maskedImage.data[pix_offset + 1];
                                pixelData[pix_offset + 2] = maskedImage.data[pix_offset + 2];
                                pixelData[pix_offset + 3] = maskedImage.data[pix_offset + 3];
                            }
                        }
                    }
                    var imageData = new ImageData(pixelData, maskedImage.width, maskedImage.height);
                    //// (2-5) output
                    var inputVideoCanvas2 = _this.inputVideoCanvas2;
                    inputVideoCanvas2.width = imageData.width;
                    inputVideoCanvas2.height = imageData.height;
                    inputVideoCanvas2.getContext("2d").putImageData(imageData, 0, 0);
                });
            }
            else {
                // console.log("no video effecting1.")
                // console.log("no video effecting2." , this.inputVideoStream)
                // console.log("no video effecting3." , this.virtualBackgroundEnabled)
                // console.log("no video effecting4." , this.bodyPix)
            }
        };
        BodyPix.load().then(function (bodyPix) {
            _this.bodyPix = bodyPix;
        });
    }
    Object.defineProperty(LocalVideoEffectors.prototype, "cameraEnabled", {
        set: function (val) { this._cameraEnabled = val; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalVideoEffectors.prototype, "virtualBackgroundEnabled", {
        set: function (val) { this._virtualBackgroundEnabled = val; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalVideoEffectors.prototype, "virtualBackgroundImagePath", {
        set: function (val) { this._virtualBackgroundImagePath = val; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalVideoEffectors.prototype, "outputWidth", {
        get: function () { return this.inputVideoCanvas2.width; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalVideoEffectors.prototype, "outputHeight", {
        get: function () { return this.inputVideoCanvas2.height; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocalVideoEffectors.prototype, "outputCanvas", {
        get: function () { return this.inputVideoCanvas2; },
        enumerable: false,
        configurable: true
    });
    return LocalVideoEffectors;
}());
export { LocalVideoEffectors };
//# sourceMappingURL=index.js.map