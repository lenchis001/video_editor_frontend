import React, { useState } from 'react';
import { Button, Form, FormGroup, Label, Input, Alert, Spinner } from 'reactstrap';

const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.108:3000';

interface VideoUploadProps {
  onSuccess: (sessionId: string) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

    const formData = new FormData();
    formData.append('video1', file);

    try {
      const res = await fetch(`${API_URL}/api/video/upload?sessionId=${crypto.randomUUID()}`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        // Assume backend returns { sessionId: string }
        const data = await res.json();
        setMessage('Video uploaded successfully!');
        onSuccess(data.sessionId || new URL(res.url).searchParams.get('sessionId') || '');
      } else {
        setMessage('Upload failed.');
      }
    } catch (err) {
      setMessage('Error uploading video.');
    } finally {
      setLoading(false);
    }
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
      {message && <Alert className="mt-3">{message}</Alert>}
    </Form>
  );
};

export default VideoUpload;
