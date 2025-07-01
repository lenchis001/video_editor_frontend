import React, { useState } from 'react';
import { Button, Form, FormGroup, Label, Input, Alert, Spinner, Progress } from 'reactstrap';

const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.108:3000';

interface VideoUploadProps {
  onSuccess: (sessionId: string) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file.');
      return;
    }
    setLoading(true);
    setMessage(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('video1', file);

    // Use XMLHttpRequest for upload progress
    const sessionId = crypto.randomUUID();
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/video/upload?sessionId=${sessionId}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setLoading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        setMessage('Video uploaded successfully!');
        try {
          const data = JSON.parse(xhr.responseText);
          onSuccess(data.sessionId || sessionId);
        } catch {
          onSuccess(sessionId);
        }
      } else {
        setMessage('Upload failed.');
      }
    };

    xhr.onerror = () => {
      setLoading(false);
      setMessage('Error uploading video.');
    };

    xhr.send(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label for="videoFile">Upload Video</Label>
        <Input
          type="file"
          name="video"
          id="videoFile"
          accept="video/*"
          onChange={handleFileChange}
        />
      </FormGroup>
      <Button color="primary" type="submit" disabled={loading}>
        {loading ? <Spinner size="sm" /> : 'Upload'}
      </Button>
      {loading && (
        <Progress value={progress} className="mt-3" animated>
          {progress}%
        </Progress>
      )}
      {message && <Alert className="mt-3">{message}</Alert>}
    </Form>
  );
};

export default VideoUpload;
