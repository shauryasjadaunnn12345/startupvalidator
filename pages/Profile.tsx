import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Profile as ProfileType } from '@/types/database';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { toast } from 'sonner';
import { Rocket, Instagram, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom'; // ✅ Corrected: Import Link from router, not lucide

const fetchProfile = async (userId: string): Promise<ProfileType> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// ✅ 3. CONSOLIDATE FOOTER COMPONENT
// Ideally, move this function to @/components/layout/Footer.tsx and import it globally.
function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/40 py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-lg">Startup Validator</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The #1 platform to validate startup ideas and find beta testers.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Discover</h3>
             <ul className="space-y-2 text-sm text-muted-foreground">
                          <li><Link to="/" className="hover:text-primary transition-colors">Startup Directory</Link></li>
                          <li><Link to="/blog" className="hover:text-primary transition-colors">Startup Blog</Link></li>
                          <li><Link to="/submit" className="hover:text-primary transition-colors">Submit Startup</Link></li>
                          <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
                        </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            {/* ✅ 1. FIX "SPA NAVIGATION" LEAK: Replaced <a> with <Link> */}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/checklist" className="hover:text-primary transition-colors">SaaS Product Launch Checklist</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              {/* Added rel="me" and actual URLs for E-E-A-T */}
              <a href="https://www.instagram.com/startupvalidator/" rel="me" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://github.com/shauryasjadaunnn12345" rel="me" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/startupvalidator/" rel="me" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:startupvliadator@zohomail.in" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Startup Validator. All rights reserved.</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            Built for beta testing platforms and startup validation
          </p>
        </div>
      </div>
    </footer>
  );
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: profile, isLoading, error } = useQuery<ProfileType | null>({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });

  const [editMode, setEditMode] = React.useState(false);
  const [fullName, setFullName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const updateProfile = useUpdateProfile();
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  // ✅ 4. SEO METADATA STRATEGY: Added robots tag and robust meta management
  useEffect(() => {
    document.title = "My Profile | Startup Validator";
    
    // Prevent indexing of private user profile pages
    const updateMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    
    updateMeta("description", "Manage your founder profile on Startup Validator.");
    updateMeta("robots", "noindex, follow");
  }, []);

  // Handle avatar file selection and preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('File size must be less than 2MB.');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Upload avatar to Supabase Storage and return public URL
  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      const ext = file.name.split('.').pop();
      const filePath = `avatars/${userId}.${ext}`;
      
      // Upsert: true allows overwriting of old avatar
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type });
      
      if (error) throw error;
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl || null;
    } catch (err) {
      console.error("Avatar upload failed:", err);
      return null;
    }
  };

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  if (!userId) return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center text-muted-foreground">Please log in to view your profile.</div>
      </div>
      <Footer />
    </Layout>
  );

  if (isLoading) return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
      <Footer />
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-destructive">Error loading profile. Please try again.</div>
      </div>
      <Footer />
    </Layout>
  );

  const handleSave = async () => {
    // Validation
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      let avatar_url = profile?.avatar_url || null;
      
      if (avatarFile && userId) {
        const url = await uploadAvatar(avatarFile, userId);
        if (!url) {
          throw new Error("Failed to upload avatar image.");
        }
        avatar_url = url;
      }

      await updateProfile.mutateAsync({
        user_id: userId,
        full_name: fullName,
        bio,
        avatar_url,
      });

      setEditMode(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    // Reset fields to original profile data
    setFullName(profile?.full_name || '');
    setBio(profile?.bio || '');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-lg shadow-lg animate-fade-in">
          <CardHeader className="flex flex-col items-center gap-2 pb-2">
            <div className="relative group h-24 w-24 mb-2">
              <Avatar className="h-24 w-24 border-2 border-background shadow-sm">
                {/* ✅ 2. ADD IMAGE TRANSFORMATION (SUPABASE): Added query params for optimization */}
                <AvatarImage 
                  src={avatarPreview || `${profile?.avatar_url}?width=200&height=200&resize=cover` || undefined} 
                  alt={profile?.full_name ?? 'User Avatar'} 
                />
                <AvatarFallback className="text-xl">
                  {profile?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Edit Overlay Button */}
              {editMode && (
                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-xs font-semibold">Change</span>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold text-center w-full">
              {editMode ? (
                <Input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  maxLength={50}
                  className="text-center font-bold text-2xl border-0 p-0 focus-visible:ring-0 shadow-none"
                  placeholder="Your Name"
                />
              ) : (
                <div className="truncate px-4" title={profile?.full_name || ''}>
                  {profile?.full_name || 'Anonymous'}
                </div>
              )}
            </CardTitle>
            
            <CardDescription className="text-center">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* ✅ 5. SEMANTIC HTML CLEANUP: Wrapped in <section> */}
            <section className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-semibold">Bio</Label>
              {editMode ? (
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="Tell us a little about yourself..."
                  className="resize-none"
                />
              ) : (
                <p className="text-sm text-muted-foreground min-h-[3rem]">
                  {profile?.bio || 'No bio provided.'}
                </p>
              )}
            </section>

            {/* ✅ 5. SEMANTIC HTML CLEANUP: Wrapped in <section> */}
            <section className="flex justify-end gap-3 pt-2">
              {editMode ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateProfile.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    loading={updateProfile.isPending}
                    disabled={updateProfile.isPending}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              )}
            </section>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </Layout>
  );
};

export default Profile;