import React, { useState } from 'react';
import { Button, Form, FormGroup, Label, Input, Row, Col, Spinner } from 'reactstrap';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.108:3000';

interface Props {
  sessionId: string;
  onStart: () => void;
}

const panels = [
  { key: 'format', label: 'params.format' },
  { key: 'bitrate', label: 'params.bitrate' },
  { key: 'timing', label: 'params.timing' },
];

const VideoProcessParams: React.FC<Props> = ({ sessionId, onStart }) => {
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [videoCodec, setVideoCodec] = useState('');
  const [audioCodec, setAudioCodec] = useState('');
  const [videoBitrate, setVideoBitrate] = useState('');
  const [audioBitrate, setAudioBitrate] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [frameRate, setFrameRate] = useState('');
  const [cutStart, setCutStart] = useState('');
  const [cutEnd, setCutEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState('format');
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const params: any = {
      outputFormat,
    };
    if (videoCodec) params.videoCodec = videoCodec;
    if (audioCodec) params.audioCodec = audioCodec;
    if (videoBitrate) params.videoBitrate = isNaN(Number(videoBitrate)) ? videoBitrate : Number(videoBitrate);
    if (audioBitrate) params.audioBitrate = isNaN(Number(audioBitrate)) ? audioBitrate : Number(audioBitrate);
    if (width && height) params.resolution = { width: Number(width), height: Number(height) };
    if (frameRate) params.frameRate = Number(frameRate);
    if (cutStart || cutEnd) params.cut = { start: cutStart ? Number(cutStart) : null, end: cutEnd ? Number(cutEnd) : null };

    try {
      const res = await fetch(`${API_URL}/api/video/process?sessionId=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        onStart();
      } else {
        // handle error
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Panel 1: Format & Codecs */}
      <div style={{ border: '1px solid #ccc', borderRadius: 4, marginBottom: 8 }}>
        <div
          style={{
            background: activePanel === 'format' ? '#f5f5f5' : '#e9ecef',
            padding: 10,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={() => setActivePanel('format')}
        >
          {t('params.format')}
        </div>
        {activePanel === 'format' && (
          <div style={{ padding: 16 }}>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>{t('params.outputFormat')}</Label>
                  <Input type="select" value={outputFormat} onChange={e => setOutputFormat(e.target.value)}>
                    <option value="mp4">mp4</option>
                    <option value="webm">webm</option>
                    <option value="mov">mov</option>
                    <option value="avi">avi</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>{t('params.videoCodec')}</Label>
                  <Input value={videoCodec} onChange={e => setVideoCodec(e.target.value)} placeholder="e.g. h264" />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>{t('params.audioCodec')}</Label>
                  <Input value={audioCodec} onChange={e => setAudioCodec(e.target.value)} placeholder="e.g. aac" />
                </FormGroup>
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* Panel 2: Bitrate & Resolution */}
      <div style={{ border: '1px solid #ccc', borderRadius: 4, marginBottom: 8 }}>
        <div
          style={{
            background: activePanel === 'bitrate' ? '#f5f5f5' : '#e9ecef',
            padding: 10,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={() => setActivePanel('bitrate')}
        >
          {t('params.bitrate')}
        </div>
        {activePanel === 'bitrate' && (
          <div style={{ padding: 16 }}>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>{t('params.videoBitrate')}</Label>
                  <Input value={videoBitrate} onChange={e => setVideoBitrate(e.target.value)} placeholder="e.g. 1000k" />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>{t('params.audioBitrate')}</Label>
                  <Input value={audioBitrate} onChange={e => setAudioBitrate(e.target.value)} placeholder="e.g. 128k" />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>{t('params.resolution')}</Label>
                  <Input
                    type="number"
                    value={width}
                    onChange={e => setWidth(e.target.value)}
                    placeholder={t('params.width')}
                    min={1}
                    style={{ display: 'inline', width: '45%', marginRight: '5%' }}
                  />
                  <Input
                    type="number"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    placeholder={t('params.height')}
                    min={1}
                    style={{ display: 'inline', width: '45%' }}
                  />
                </FormGroup>
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* Panel 3: Timing & Cut */}
      <div style={{ border: '1px solid #ccc', borderRadius: 4, marginBottom: 8 }}>
        <div
          style={{
            background: activePanel === 'timing' ? '#f5f5f5' : '#e9ecef',
            padding: 10,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={() => setActivePanel('timing')}
        >
          {t('params.timing')}
        </div>
        {activePanel === 'timing' && (
          <div style={{ padding: 16 }}>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>{t('params.frameRate')}</Label>
                  <Input value={frameRate} onChange={e => setFrameRate(e.target.value)} placeholder="e.g. 30" />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>{t('params.cutStart')}</Label>
                  <Input value={cutStart} onChange={e => setCutStart(e.target.value)} placeholder={t('params.cutStart')} />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>{t('params.cutEnd')}</Label>
                  <Input value={cutEnd} onChange={e => setCutEnd(e.target.value)} placeholder={t('params.cutEnd')} />
                </FormGroup>
              </Col>
            </Row>
          </div>
        )}
      </div>

      <Button color="primary" type="submit" disabled={loading}>
        {loading ? <Spinner size="sm" /> : t('params.start')}
      </Button>
    </Form>
  );
};

export default VideoProcessParams;
