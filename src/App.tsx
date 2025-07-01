import React, { useState, useEffect } from 'react';
import { Container, Navbar, NavbarBrand, Progress, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import VideoUpload from './components/VideoUpload';
import VideoProcessParams from './components/VideoProcessParams';

enum Step {
  Upload = 1,
  SetupParams,
  Processing,
  Download
}

function App() {
  const [step, setStep] = useState<Step>(Step.Upload);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Usage agreement modal state
  const [showAgreement, setShowAgreement] = useState(false);

  useEffect(() => {
    const agreed = localStorage.getItem('usageAgreementAccepted');
    if (!agreed) setShowAgreement(true);
  }, []);

  const handleAgreementAccept = () => {
    localStorage.setItem('usageAgreementAccepted', 'true');
    setShowAgreement(false);
  };

  // Handler after upload
  const handleUploadSuccess = (sessionId: string) => {
    setSessionId(sessionId);
    setStep(Step.SetupParams);
    setError(null);
  };

  // Handler after starting processing
  const handleProcessStart = () => {
    setStep(Step.Processing);
    setError(null);
    pollStatus();
  };

  // Polling for processing status
  const pollStatus = async () => {
    if (!sessionId) return;
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.108:3000';
      let status = '';
      while (status !== 'done') {
        const res = await fetch(`${API_URL}/api/video/status?sessionId=${sessionId}`);
        if (!res.ok) throw new Error('Failed to get status');
        const data = await res.json();
        status = data.status;
        if (status === 'done') {
          setStep(Step.Download);
          setResultUrl(`${API_URL}/api/video/download?sessionId=${sessionId}`);
          break;
        } else if (status === 'error') {
          setError('Processing failed.');
          break;
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (e) {
      setError('Error while processing.');
    }
  };

  // Handler for download step reset
  const handleReset = () => {
    setStep(Step.Upload);
    setSessionId(null);
    setResultUrl(null);
    setError(null);
  };

  return (
    <>
      {/* Usage Agreement Modal */}
      <Modal isOpen={showAgreement} backdrop="static" centered>
        <ModalHeader>Usage Agreement</ModalHeader>
        <ModalBody>
          <p>
            By using this service, you acknowledge and agree that any files you upload will be stored temporarily for processing and for a limited time after processing to allow you to download the results. Files may be deleted at any time after processing is complete.
          </p>
          <p>
            <strong>It is strictly forbidden to upload, process, or use any media content that is protected by copyright unless you have the legal right to do so.</strong>
          </p>
          <p>
            You must agree to these terms to use the service.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAgreementAccept}>
            I Agree
          </Button>
        </ModalFooter>
      </Modal>
      <Navbar color="dark" dark expand="md">
        <NavbarBrand href="/">Video Edit Frontend</NavbarBrand>
      </Navbar>
      <Container className="mt-4">
        <Progress value={step * 25} className="mb-4" />
        {error && <Alert color="danger">{error}</Alert>}
        {step === Step.Upload && (
          <>
            <h3 className="mb-3">Step 1/4: Uploading video</h3>
            <VideoUpload onSuccess={handleUploadSuccess} />
          </>
        )}
        {step === Step.SetupParams && sessionId && (
          <>
            <h3 className="mb-3">Step 2/4: Setting up parameters</h3>
            <VideoProcessParams sessionId={sessionId} onStart={handleProcessStart} />
          </>
        )}
        {step === Step.Processing && (
          <>
            <h3 className="mb-3">Step 3/4: Processing</h3>
            <div>
              <h4>Processing...</h4>
              <p>Please wait while your video is being processed.</p>
            </div>
          </>
        )}
        {step === Step.Download && resultUrl && (
          <>
            <h3 className="mb-3">Step 4/4: Download result</h3>
            <div>
              <h4>Processing Complete!</h4>
              <a href={resultUrl} className="btn btn-success" download>
                Download Result
              </a>
              <Button color="secondary" className="ms-3" onClick={handleReset}>
                Start New Task
              </Button>
            </div>
          </>
        )}
      </Container>
    </>
  );
}

export default App;
