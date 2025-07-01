import React, { useState, useEffect } from 'react';
import { Container, Navbar, NavbarBrand, Progress, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import VideoUpload from './components/VideoUpload';
import VideoProcessParams from './components/VideoProcessParams';
import { useTranslation } from 'react-i18next';

enum Step {
  Upload = 1,
  SetupParams,
  Processing,
  Download
}

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'pl', label: 'Polski' },
  { code: 'uk', label: 'Українська' },
  { code: 'be', label: 'Беларуская' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' }
];

function App() {
  const [step, setStep] = useState<Step>(Step.Upload);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAgreement, setShowAgreement] = useState(false);

  // Language dropdown state
  const [langDropdown, setLangDropdown] = useState(false);
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const agreed = localStorage.getItem('usageAgreementAccepted');
    if (!agreed) setShowAgreement(true);
    // Sync language from i18n (in case it was set in i18n.ts)
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const handleAgreementAccept = () => {
    localStorage.setItem('usageAgreementAccepted', 'true');
    setShowAgreement(false);
  };

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('selectedLanguage', code);
    setCurrentLang(code);
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
          setError(t('error.failed'));
          break;
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (e) {
      setError(t('error.processing'));
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
        <ModalHeader>{t('agreement.title')}</ModalHeader>
        <ModalBody>
          <p>{t('agreement.p1')}</p>
          <p>
            <strong>{t('agreement.p2')}</strong>
          </p>
          <p>{t('agreement.p3')}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAgreementAccept}>
            {t('agreement.accept')}
          </Button>
        </ModalFooter>
      </Modal>
      <Navbar color="dark" dark expand="md" className="d-flex justify-content-between">
        <NavbarBrand href="/">{t('navbar.title')}</NavbarBrand>
        <div>
          <Dropdown isOpen={langDropdown} toggle={() => setLangDropdown(v => !v)}>
            <DropdownToggle caret color="secondary">
              {t('language')}
            </DropdownToggle>
            <DropdownMenu>
              {LANGS.map(l => (
                <DropdownItem
                  key={l.code}
                  onClick={() => handleLangChange(l.code)}
                  active={currentLang === l.code}
                >
                  {l.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </Navbar>
      <Container className="mt-4">
        <Progress value={step * 25} className="mb-4" />
        {error && <Alert color="danger">{error}</Alert>}
        {step === Step.Upload && (
          <>
            <h3 className="mb-3">{t('step.upload')}</h3>
            <VideoUpload onSuccess={handleUploadSuccess} />
          </>
        )}
        {step === Step.SetupParams && sessionId && (
          <>
            <h3 className="mb-3">{t('step.params')}</h3>
            <VideoProcessParams sessionId={sessionId} onStart={handleProcessStart} />
          </>
        )}
        {step === Step.Processing && (
          <>
            <h3 className="mb-3">{t('step.processing')}</h3>
            <div>
              <h4>{t('processing.title')}</h4>
              <p>{t('processing.wait')}</p>
            </div>
          </>
        )}
        {step === Step.Download && resultUrl && (
          <>
            <h3 className="mb-3">{t('step.download')}</h3>
            <div>
              <h4>{t('processing.complete')}</h4>
              <a href={resultUrl} className="btn btn-success" download>
                {t('download.result')}
              </a>
              <Button color="secondary" className="ms-3" onClick={handleReset}>
                {t('download.new')}
              </Button>
            </div>
          </>
        )}
      </Container>
    </>
  );
}

export default App;
