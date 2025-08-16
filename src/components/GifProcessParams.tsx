import React, { useState } from 'react';
import { Button, Form, FormGroup, Label, Input, Row, Col, Spinner } from 'reactstrap';
import { useTranslation } from 'react-i18next';

interface Props {
  sessionId: string;
  onStart: () => void;
}

const GifProcessParams: React.FC<Props> = ({ sessionId, onStart }) => {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [frameRate, setFrameRate] = useState('');
  const [cutStart, setCutStart] = useState('');
  const [cutEnd, setCutEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState('resolution');
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const params: any = {};
    
    if (width) params.width = Number(width);
    if (height) params.height = Number(height);
    if (frameRate) params.frameRate = Number(frameRate);
    if (cutStart) params.startTime = Number(cutStart);
    if (cutEnd && cutStart) {
      const duration = Number(cutEnd) - Number(cutStart);
      if (duration > 0) params.duration = duration;
    } else if (cutEnd && !cutStart) {
      params.duration = Number(cutEnd);
    }

    try {
      const res = await fetch(`/api/gif/process?id=${sessionId}`, {
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
      {/* Panel 1: Resolution */}
      <div style={{ border: '1px solid #ccc', borderRadius: 4, marginBottom: 8 }}>
        <div
          style={{
            background: activePanel === 'resolution' ? '#f5f5f5' : '#e9ecef',
            padding: 10,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={() => setActivePanel('resolution')}
        >
          {t('params.resolution')}
        </div>
        {activePanel === 'resolution' && (
          <div style={{ padding: 16 }}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>{t('params.width')}</Label>
                  <Input
                    type="number"
                    value={width}
                    onChange={e => setWidth(e.target.value)}
                    placeholder={t('params.width')}
                    min={1}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>{t('params.height')}</Label>
                  <Input
                    type="number"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    placeholder={t('params.height')}
                    min={1}
                  />
                </FormGroup>
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* Panel 2: Timing & Cut */}
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
                  <Input 
                    type="number" 
                    value={frameRate} 
                    onChange={e => setFrameRate(e.target.value)} 
                    placeholder="e.g. 15" 
                    min={1}
                    max={60}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>{t('params.cutStart')}</Label>
                  <Input 
                    type="number" 
                    value={cutStart} 
                    onChange={e => setCutStart(e.target.value)} 
                    placeholder={t('params.cutStart')} 
                    min={0}
                    step={0.1}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>{t('params.cutEnd')}</Label>
                  <Input 
                    type="number" 
                    value={cutEnd} 
                    onChange={e => setCutEnd(e.target.value)} 
                    placeholder={t('params.cutEnd')} 
                    min={0}
                    step={0.1}
                  />
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

export default GifProcessParams;
