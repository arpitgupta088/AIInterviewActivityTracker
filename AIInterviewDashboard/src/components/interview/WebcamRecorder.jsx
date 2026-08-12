import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import recordingService from "../../services/recordingService";

const WebcamRecorder = forwardRef(({onPermissionEvent}, ref) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const stream = recordingService.getStream();

    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    return () => {
      if(videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  useImperativeHandle(ref, () => ({
    startRecording() {
      recordingService.startRecording();
    },

    async stopRecording() {
      return await recordingService.stopRecording();
    },

    stopCamera() {
      recordingService.stopStream();
    },
  }));

  return (
    <div className="text-center">

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded shadow"
        style={{
          width: "100%",
          maxWidth: "420px",
          border: "2px solid #dee2e6",
        }}
      />

    </div>
  );
});

WebcamRecorder.displayName = "WebcamRecorder";

export default WebcamRecorder;