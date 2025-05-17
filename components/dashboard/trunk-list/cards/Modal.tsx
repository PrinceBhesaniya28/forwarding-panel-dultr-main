'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useState } from 'react';

type Trunk = {
  id: number;
  trunkName: string | null;
  serverIp: string;
  username: string;
  secret: string;
  ipAuth: boolean;
  status: boolean;
  prefix: string;
};

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trunk: Trunk) => void;
  data: Trunk;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (trunk: Omit<Trunk, 'id'>) => void;
}

export function EditModal({ isOpen, onClose, onSave, data }: EditModalProps) {
  const [formData, setFormData] = useState<Trunk>(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If IP Auth is true, don't send username and secret
    if (formData.ipAuth) {
      const { username, secret, ...restData } = formData;
      onSave({ ...restData, username: '', secret: '' });
    } else {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Trunk</DialogTitle>
          <DialogDescription>
            Make changes to the trunk configuration here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trunkName" className="text-right">
                Trunk Name
              </Label>
              <Input
                id="trunkName"
                value={formData.trunkName}
                onChange={(e) =>
                  setFormData({ ...formData, trunkName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serverIp" className="text-right">
                Server IP
              </Label>
              <Input
                id="serverIp"
                value={formData.serverIp}
                onChange={(e) =>
                  setFormData({ ...formData, serverIp: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prefix" className="text-right">
                Prefix
              </Label>
              <Input
                id="prefix"
                value={formData.prefix || null}
                onChange={(e) =>
                  setFormData({ ...formData, prefix: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter trunk prefix"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ipAuth" className="text-right">
                IP Auth
              </Label>
              <div className="col-span-3">
                <Switch
                  id="ipAuth"
                  checked={formData.ipAuth}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ipAuth: checked })
                  }
                />
                <span className="ml-2 text-sm text-zinc-500">
                  {formData.ipAuth
                    ? 'Using IP Auth'
                    : 'Using username/password Auth'}
                </span>
              </div>
            </div>

            {!formData.ipAuth && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="secret" className="text-right">
                    Secret
                  </Label>
                  <Input
                    id="secret"
                    type="password"
                    value={formData.secret}
                    onChange={(e) =>
                      setFormData({ ...formData, secret: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, status: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName
}: DeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Trunk</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the trunk &quot;{itemName}&quot;?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateModal({ isOpen, onClose, onCreate }: CreateModalProps) {
  const [formData, setFormData] = useState<Omit<Trunk, 'id'>>({
    trunkName: '',
    serverIp: '',
    username: '',
    secret: '',
    ipAuth: false,
    status: true,
    prefix: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If IP Auth is true, don't send username and secret
    if (formData.ipAuth) {
      const { username, secret, ...restData } = formData;
      onCreate({ ...restData, username: '', secret: '' });
    } else {
      onCreate(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Trunk</DialogTitle>
          <DialogDescription>
            Fill in the details for the new trunk configuration.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trunkName" className="text-right">
                Trunk Name
              </Label>
              <Input
                id="trunkName"
                value={formData.trunkName}
                onChange={(e) =>
                  setFormData({ ...formData, trunkName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serverIp" className="text-right">
                Server IP
              </Label>
              <Input
                id="serverIp"
                value={formData.serverIp}
                onChange={(e) =>
                  setFormData({ ...formData, serverIp: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prefix" className="text-right">
                Prefix
              </Label>
              <Input
                id="prefix"
                value={formData.prefix}
                onChange={(e) =>
                  setFormData({ ...formData, prefix: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter trunk prefix"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ipAuth" className="text-right">
                IP Auth
              </Label>
              <div className="col-span-3">
                <Switch
                  id="ipAuth"
                  checked={formData.ipAuth}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ipAuth: checked })
                  }
                />
                <span className="ml-2 text-sm text-zinc-500">
                  {formData.ipAuth
                    ? 'Using IP Auth'
                    : 'Using username/password Auth'}
                </span>
              </div>
            </div>

            {!formData.ipAuth && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="secret" className="text-right">
                    Secret
                  </Label>
                  <Input
                    id="secret"
                    type="password"
                    value={formData.secret}
                    onChange={(e) =>
                      setFormData({ ...formData, secret: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, status: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create trunk</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
