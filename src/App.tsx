import React, { useState, useEffect } from 'react';
import { Container, Navbar, NavbarBrand, Progress, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Nav, NavItem, NavLink } from 'reactstrap';
import VideoUpload from './components/VideoUpload';
import VideoProcessParams from './components/VideoProcessParams';
import GifUpload from './components/GifUpload';
import GifProcessParams from './components/GifProcessParams';
import { useTranslation } from 'react-i18next';

enum Step {
  Upload = 1,
  SetupParams,
  Processing,
  Download
}

enum ProcessType {
  Video = 'video',
  Gif = 'gif'
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
  const [processType, setProcessType] = useState<ProcessType>(ProcessType.Video);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAgreement, setShowAgreement] = useState(false);
  const [progress, setProgress] = useState<number>(0);

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
    setProgress(0);
    pollStatus();
  };

  // Polling for processing status
  const pollStatus = async () => {
    if (!sessionId) return;
    try {
      let status = '';
      while (status !== 'done') {
        const res = await fetch(`/api/${processType}/status?id=${sessionId}`);
        if (!res.ok) throw new Error('Failed to get status');
        const data = await res.json();
        status = data.status;
        
        // Update progress if available
        if (data.progress !== undefined) {
          setProgress(Math.round(data.progress));
        }
        
        if (status === 'done') {
          setProgress(100);
          setStep(Step.Download);
          setResultUrl(`/api/${processType}/download?id=${sessionId}`);
          break;
        } else if (status === 'error' || status === 'failed') {
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
    setProgress(0);
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
            
            {/* Type selection tabs */}
            <Nav tabs className="mb-3">
              <NavItem>
                <NavLink 
                  active={processType === ProcessType.Video}
                  onClick={() => setProcessType(ProcessType.Video)}
                  style={{ cursor: 'pointer' }}
                >
                  {t('type.video')}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink 
                  active={processType === ProcessType.Gif}
                  onClick={() => setProcessType(ProcessType.Gif)}
                  style={{ cursor: 'pointer' }}
                >
                  {t('type.gif')}
                </NavLink>
              </NavItem>
            </Nav>

            {processType === ProcessType.Video ? (
              <VideoUpload onSuccess={handleUploadSuccess} />
            ) : (
              <GifUpload onSuccess={handleUploadSuccess} />
            )}
          </>
        )}
        {step === Step.SetupParams && sessionId && (
          <>
            <h3 className="mb-3">{t('step.params')}</h3>
            {processType === ProcessType.Video ? (
              <VideoProcessParams sessionId={sessionId} onStart={handleProcessStart} />
            ) : (
              <GifProcessParams sessionId={sessionId} onStart={handleProcessStart} />
            )}
          </>
        )}
        {step === Step.Processing && (
          <>
            <h3 className="mb-3">{t('step.processing')}</h3>
            <div>
              <h4>{t('processing.title')}</h4>
              <p>{t('processing.wait')}</p>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>{t('processing.progress')}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} color="info" striped animated />
              </div>
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
