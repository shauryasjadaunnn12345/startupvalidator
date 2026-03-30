import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import {
  usePendingValidations,
  useAllValidations,
  useUpdateValidationStatus,
  useAllStartups,
  useUpdateStartupStatus,
  useAllComments,
  useDeleteComment,
} from '@/hooks/useAdmin';
import { 
  Shield, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Rocket,
  MessageSquare,
  Eye,
  Trash2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ValidationStatus, StartupStatus } from '@/types/database';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  flagged: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  queued: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  live: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  
  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center">
          <Shield className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Manage validations, startups, and comments</p>
          </div>
        </div>

        <Tabs defaultValue="validations" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-full grid-cols-3 sm:max-w-md">
            <TabsTrigger value="validations" className="gap-2">
              <Eye className="h-4 w-4" />
              Validations
            </TabsTrigger>
            <TabsTrigger value="startups" className="gap-2">
              <Rocket className="h-4 w-4" />
              Startups
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validations">
            <ValidationsTab />
          </TabsContent>

          <TabsContent value="startups">
            <StartupsTab />
          </TabsContent>

          <TabsContent value="comments">
            <CommentsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function ValidationsTab() {
  const { data: pending = [], isLoading: pendingLoading } = usePendingValidations();
  const { data: all = [], isLoading: allLoading } = useAllValidations();
  const updateStatus = useUpdateValidationStatus();
  
  const [selectedValidation, setSelectedValidation] = useState<string | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');

  const handleAction = async () => {
    if (!selectedValidation || !action) return;
    
    await updateStatus.mutateAsync({
      validationId: selectedValidation,
      status: action === 'approve' ? 'approved' : 'rejected',
      reason: reason || undefined
    });
    
    setSelectedValidation(null);
    setAction(null);
    setReason('');
  };

  if (pendingLoading || allLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Pending Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Pending Review ({pending.length})
          </CardTitle>
          <CardDescription>Validations flagged by AI or needing override</CardDescription>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending validations</p>
          ) : (
            <div className="space-y-4">
              {pending.map((validation) => (
                <div key={validation.id} className="rounded-lg border p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm font-medium sm:text-base">{validation.profile?.full_name || 'Anonymous'}</span>
                        <span className="text-muted-foreground hidden sm:inline">→</span>
                        <span className="text-sm font-medium sm:text-base">{validation.startup?.name}</span>
                        <Badge className={cn("text-xs", statusColors[validation.ai_status])}>
                          AI: {validation.ai_status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 sm:text-sm">{validation.content}</p>
                      {validation.ai_reason && (
                        <p className="text-xs text-muted-foreground italic">
                          AI Reason: {validation.ai_reason}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={() => {
                          setSelectedValidation(validation.id);
                          setAction('approve');
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => {
                          setSelectedValidation(validation.id);
                          setAction('reject');
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Validations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Validations</CardTitle>
          <CardDescription>All validations history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {all.slice(0, 20).map((validation) => (
              <div key={validation.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm">{validation.profile?.full_name || 'Anonymous'}</span>
                  <span className="text-muted-foreground hidden sm:inline">→</span>
                  <span className="text-xs sm:text-sm">{validation.startup?.name}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusColors[validation.ai_status]}>
                    AI: {validation.ai_status}
                  </Badge>
                  {validation.admin_status && (
                    <Badge className={statusColors[validation.admin_status]}>
                      Admin: {validation.admin_status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedValidation && !!action} onOpenChange={() => {
        setSelectedValidation(null);
        setAction(null);
        setReason('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve' : 'Reject'} Validation
            </DialogTitle>
            <DialogDescription>
              {action === 'approve' 
                ? 'This will count towards the user\'s validation requirement.'
                : 'Provide a reason for rejection.'}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason (optional for approve, recommended for reject)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedValidation(null);
              setAction(null);
              setReason('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              disabled={updateStatus.isPending}
              className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {updateStatus.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StartupsTab() {
  const { data: startups = [], isLoading } = useAllStartups();
  const updateStatus = useUpdateStartupStatus();
  
  const [selectedStartup, setSelectedStartup] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<StartupStatus>('pending');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleUpdate = async () => {
    if (!selectedStartup) return;
    
    await updateStatus.mutateAsync({
      startupId: selectedStartup,
      status: newStatus,
      rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined,
      launchDate: newStatus === 'live' ? new Date().toISOString().split('T')[0] : undefined
    });
    
    setSelectedStartup(null);
    setNewStatus('pending');
    setRejectionReason('');
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const grouped = {
    pending: startups.filter(s => s.status === 'pending'),
    queued: startups.filter(s => s.status === 'queued'),
    live: startups.filter(s => s.status === 'live'),
    rejected: startups.filter(s => s.status === 'rejected'),
  };

  return (
    <div className="space-y-6">
      {/* Pending Startups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Pending Startups ({grouped.pending.length})
          </CardTitle>
          <CardDescription>Startups awaiting review</CardDescription>
        </CardHeader>
        <CardContent>
          {grouped.pending.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending startups</p>
          ) : (
            <div className="space-y-4">
              {grouped.pending.map((startup) => (
                <div key={startup.id} className="rounded-lg border p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold sm:text-base">{startup.name}</span>
                        <Badge variant="secondary" className="text-xs">{startup.category?.name}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground sm:text-sm">{startup.tagline}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By {startup.profile?.full_name} • {format(new Date(startup.created_at), 'PP')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={() => {
                          setSelectedStartup(startup.id);
                          setNewStatus('live');
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Launch Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600"
                        onClick={() => {
                          setSelectedStartup(startup.id);
                          setNewStatus('queued');
                        }}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Queue
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => {
                          setSelectedStartup(startup.id);
                          setNewStatus('rejected');
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queued */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Queued ({grouped.queued.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {grouped.queued.map((startup) => (
              <div key={startup.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <span className="font-medium">{startup.name}</span>
                  <span className="text-muted-foreground ml-2">• {startup.category?.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600"
                  onClick={async () => {
                    await updateStatus.mutateAsync({
                      startupId: startup.id,
                      status: 'live',
                      launchDate: new Date().toISOString().split('T')[0]
                    });
                  }}
                >
                  Launch Now
                </Button>
              </div>
            ))}
            {grouped.queued.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No queued startups</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Live ({grouped.live.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {grouped.live.map((startup) => (
              <div key={startup.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <span className="font-medium">{startup.name}</span>
                  <span className="text-muted-foreground ml-2">• {startup.upvote_count} upvotes</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {startup.launch_date && format(new Date(startup.launch_date), 'PP')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedStartup} onOpenChange={() => {
        setSelectedStartup(null);
        setNewStatus('pending');
        setRejectionReason('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Startup Status</DialogTitle>
            <DialogDescription>
              {newStatus === 'live' && 'This will immediately launch the startup.'}
              {newStatus === 'queued' && 'This will add the startup to the launch queue.'}
              {newStatus === 'rejected' && 'Please provide a reason for rejection.'}
            </DialogDescription>
          </DialogHeader>
          {newStatus === 'rejected' && (
            <Textarea
              placeholder="Rejection reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedStartup(null);
              setNewStatus('pending');
              setRejectionReason('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updateStatus.isPending || (newStatus === 'rejected' && !rejectionReason)}
            >
              {updateStatus.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CommentsTab() {
  const { data: comments = [], isLoading } = useAllComments();
  const deleteComment = useDeleteComment();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Comments ({comments.length})</CardTitle>
        <CardDescription>Moderate community comments</CardDescription>
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No comments yet</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.profile?.full_name || 'Anonymous'}</span>
                      <span className="text-muted-foreground text-xs">on</span>
                      <span className="font-medium text-sm">{comment.startup?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'PP p')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteId(comment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={async () => {
                if (deleteId) {
                  await deleteComment.mutateAsync(deleteId);
                  setDeleteId(null);
                }
              }}
              disabled={deleteComment.isPending}
            >
              {deleteComment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
