/**
 * @param kind
 */
export declare const getDeviceLists: () => Promise<{
    audioinput: MediaDeviceInfo[];
    videoinput: MediaDeviceInfo[];
    audiooutput: MediaDeviceInfo[];
    videoinputres: {
        deviceId: string;
        groupId: string;
        kind: string;
        label: string;
    }[];
}>;
export declare const getVideoDevice: (deviceId: string) => Promise<MediaStream | null>;
export declare class LocalVideoEffectors {
    private deviceId;
    private inputVideoStream;
    private inputVideoElement;
    private inputMaskCanvas;
    private virtualBGImage;
    private virtualBGCanvas;
    private inputVideoCanvas2;
    private _cameraEnabled;
    private _virtualBackgroundEnabled;
    private _virtualBackgroundImagePath;
    private bodyPix;
    set cameraEnabled(val: boolean);
    set virtualBackgroundEnabled(val: boolean);
    set virtualBackgroundImagePath(val: string);
    get outputWidth(): number;
    get outputHeight(): number;
    get outputCanvas(): HTMLCanvasElement;
    constructor();
    selectInputVideoDevice: (deviceId: string) => Promise<void>;
    stopInputMediaStream: () => void;
    getMediaStream: () => MediaStream;
    doEffect: (width: number, height: number) => void;
}
