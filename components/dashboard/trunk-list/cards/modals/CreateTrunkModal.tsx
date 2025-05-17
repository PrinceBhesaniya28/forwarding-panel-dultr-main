'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CreateTrunkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTrunkModal({ isOpen, onClose, onSuccess }: CreateTrunkModalProps) {
  const [formData, setFormData] = useState({
    trunkName: '',
    serverIp: '',
    username: '',
    secret: '',
    ipAuth: false,
    status: false
  });

  const handleCreate = async () => {
    try {
      const response = await fetch('https://dialo.dollu.com/rest/trunks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create trunk');
      }

      const result = await response.json();
      
      if (result.success) {
      onSuccess();
      onClose();
      setFormData({
        trunkName: '',
        serverIp: '',
        username: '',
        secret: '',
        ipAuth: false,
        status: false
      });
      toast.success('Trunk created successfully');
      } else {
        throw new Error(result.message || 'Failed to create trunk');
      }
    } catch (error) {
      console.error('Error creating trunk:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create trunk');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Trunk</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="trunkName">Trunk Name</Label>
            <Input
              id="trunkName"
              value={formData.trunkName}
              onChange={(e) => setFormData({ ...formData, trunkName: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="serverIp">Server IP</Label>
            <Input
              id="serverIp"
              value={formData.serverIp}
              onChange={(e) => setFormData({ ...formData, serverIp: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="secret">Secret</Label>
            <Input
              id="secret"
              type="password"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="ipAuth"
              checked={formData.ipAuth}
              onCheckedChange={(checked) => setFormData({ ...formData, ipAuth: checked })}
            />
            <Label htmlFor="ipAuth">IP Auth</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="status"
              checked={formData.status}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
            />
            <Label htmlFor="status">Status</Label>
          </div>
        </div>
        <Button onClick={handleCreate}>Create Trunk</Button>
      </DialogContent>
    </Dialog>
  );
} 