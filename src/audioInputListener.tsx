import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

type AudioInputDeviceMap = Record<string, string>; // map of deviceId to human-readable name

export const AudioInputListener: React.FC = props => {
  const [mediaDevices, setMediaDevices] = useState<AudioInputDeviceMap>({});
  const [selectedMediaDevice, setSelectedMediaDevice] = useState<string>('');
  
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
          analayserNode.fftSize = 2048;
          const bufferLength = analayserNode.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const printOutData = () => {
            // requestAnimationFrame(printOutData);
            analayserNode.getByteTimeDomainData(dataArray);
            for (let i = 0; i < bufferLength; i++) {
              console.log(dataArray[i]);
            }
          }

          streamSource.connect(analayserNode);
          analayserNode.connect(audioCtx.destination);
          // TODO: need to access the frequency data and display it on screen
          printOutData();
        })
        .catch(e => {
          // do some error handling here
        });
    }

  }, [selectedMediaDevice])

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
    </div>
  );
};
