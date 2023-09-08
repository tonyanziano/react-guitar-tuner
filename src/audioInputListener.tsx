import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

type AudioInputDeviceMap = Record<string, string>; // map of deviceId to human-readable name

const visualizationCanvasId = 'visualization-canvas';

export const AudioInputListener: React.FC = props => {
  const [mediaDevices, setMediaDevices] = useState<AudioInputDeviceMap>({});
  const [selectedMediaDevice, setSelectedMediaDevice] = useState<string>('');
  const visualizationCanvas = useRef<HTMLCanvasElement>(null);
  
  // initialization
  useEffect(() => {
    navigator.mediaDevices
      // do this to ask for permission to use the microphone
      // (devices that haven't yet given access won't show when we try to enumerate them)
      .getUserMedia({ audio: true, video: false })
      // grab a list of audio input devices
      .then(() => { return navigator.mediaDevices.enumerateDevices() })
      .then(devices => {
        const audioInputDevices =
          devices
            .filter(device => device.kind === 'audioinput')
            .reduce((map, device) => { map[device.deviceId] = device.label; return map;}, {} as AudioInputDeviceMap);
        
        setMediaDevices(audioInputDevices);

        const audioInputDeviceIds = Object.keys(audioInputDevices)
        if (audioInputDeviceIds.length) {
          setSelectedMediaDevice(audioInputDeviceIds[0]);
        }
      })
      .catch(e => {
        // do some error handling here
      });
  }, []);

  // when the media device changes, pipe the media device stream into an audio context
  useEffect(() => {
    // ask for permission to use the selected audio input device and access its stream
    if (selectedMediaDevice) {
      navigator.mediaDevices
        .getUserMedia({ audio: { deviceId: selectedMediaDevice }, video: false })
        .then(stream => {
          // TODO: probably initialize the context and audio nodes in the initial useEffect() and store them in a ref or something
          const audioCtx = new AudioContext();
          const streamSource = audioCtx.createMediaStreamSource(stream);

          // configure analyser node to grab frequency data
          const analayserNode = audioCtx.createAnalyser();
          analayserNode.fftSize = 2048; // FFT = fast-fourier-transform (maps sound wave from time bucket domain to frequency bucket domain)
          const numFrequencyBuckets = analayserNode.frequencyBinCount;
          const dataArray = new Uint8Array(numFrequencyBuckets);

          const drawFFTGraph = () => {
            const canvasCtx = visualizationCanvas.current?.getContext('2d');
            if (visualizationCanvas.current && canvasCtx) {
              // configure canvas for drawing
              canvasCtx.fillStyle = "rgb(200, 200, 200)";
              canvasCtx.fillRect(0, 0, visualizationCanvas.current.width, visualizationCanvas.current.height);

              canvasCtx.lineWidth = 2;
              canvasCtx.strokeStyle = "rgb(0, 0, 0)";

              canvasCtx.beginPath();

              // grab the frequency data and place it into the data array
              analayserNode.getByteTimeDomainData(dataArray);

              // bucket width
              const bucketWidth = (visualizationCanvas.current?.width * 1) / numFrequencyBuckets;
              let x = 0; // starting point of drawing

              for (let i = 0; i < numFrequencyBuckets; i++) {
                // draw bar for the frequency bucket
                const v = dataArray[i] / 128.0;
                const y = (v * visualizationCanvas.current.height) / 2;
            
                if (i === 0) {
                  canvasCtx.moveTo(x, y);
                } else {
                  canvasCtx.lineTo(x, y);
                }
            
                x += bucketWidth;
              }

              canvasCtx.stroke();

              // loop
              requestAnimationFrame(drawFFTGraph);
            }
          }

          streamSource.connect(analayserNode);
          analayserNode.connect(audioCtx.destination);
          // TODO: need to access the frequency data and display it on screen
          if (visualizationCanvas.current) {
            drawFFTGraph();
          }
        })
        .catch(e => {
          // do some error handling here
        });
    }

  }, [selectedMediaDevice, visualizationCanvas])

  const onSelectMediaDevice = useCallback((ev: ChangeEvent<HTMLSelectElement>) => {
    console.log('selected: ', ev.target.value);
    setSelectedMediaDevice(ev.target.value);
  }, []);

  return (
    <div>
      <select onChange={onSelectMediaDevice}>
        {Object.keys(mediaDevices).map(deviceId => {
          return <option key={deviceId} value={deviceId}>{mediaDevices[deviceId]}</option>
        })}
      </select>
      <canvas id={visualizationCanvasId} ref={visualizationCanvas}></canvas>
    </div>
  );
};
