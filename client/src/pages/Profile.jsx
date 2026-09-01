import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProfile, updateProfile } from '@/services/auth.api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getProfile()
      .then((data) => {
        if (isMounted) {
          setProfileData(data);
          setEditName(data.name || user?.name || '');
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load profile data:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!editName.trim() || editName.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateProfile({ name: editName.trim() });
      setUser((prev) => ({ ...prev, name: updated.name }));
      setProfileData((prev) => (prev ? { ...prev, name: updated.name } : prev));
      setIsEditing(false);
      toast.success('Profile name updated successfully');
    } catch (err) {
      console.error('Update name error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile name');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'TF';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = profileData?.name || user?.name || 'Developer';
  const displayEmail = profileData?.email || user?.email || '';
  const joinedDate = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">User Profile</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Personal account identity, workspace statistics, and associated project roles
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-zinc-700">
              <AvatarFallback className="bg-zinc-800 text-zinc-100 font-bold text-xl">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-100">{displayName}</h2>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono font-medium px-2 py-0.5 rounded">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">{displayEmail}</p>
              <p className="text-[11px] text-zinc-500">Member since {joinedDate}</p>
            </div>
          </div>

          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditName(displayName);
                setIsEditing(true);
              }}
              className="bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs self-start sm:self-center"
            >
              Edit Name
            </Button>
          ) : null}
        </div>

        {/* Inline Edit Form */}
        {isEditing && (
          <form onSubmit={handleUpdateName} className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-200">Edit Display Name</h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your full name"
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-md text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 w-full max-w-sm"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-medium h-8"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 h-8"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Account Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-1">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Joined Projects</p>
          <p className="text-2xl font-bold text-zinc-100 font-mono">
            {profileData?.stats?.projectsJoined ?? (isLoading ? '...' : 0)}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-1">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Reported Issues</p>
          <p className="text-2xl font-bold text-zinc-100 font-mono">
            {profileData?.stats?.issuesReported ?? (isLoading ? '...' : 0)}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-1">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Assigned Active</p>
          <p className="text-2xl font-bold text-amber-400 font-mono">
            {profileData?.stats?.assignedOpenIssues ?? (isLoading ? '...' : 0)}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-1">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Completed Tasks</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            {profileData?.stats?.assignedCompletedIssues ?? (isLoading ? '...' : 0)}
          </p>
        </div>
      </div>

      {/* Associated Projects Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
            Associated Projects ({profileData?.projects?.length || 0})
          </h2>
          <Link to="/projects">
            <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white h-7">
              View All Projects →
            </Button>
          </Link>
        </div>

        {profileData?.projects && profileData.projects.length > 0 ? (
          <div className="divide-y divide-zinc-800/80">
            {profileData.projects.map((proj) => (
              <div key={proj.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <Link
                    to={`/projects/${proj.id}`}
                    className="text-xs font-semibold text-zinc-100 hover:underline block truncate"
                  >
                    {proj.title}
                  </Link>
                  <p className="text-[11px] text-zinc-400 truncate max-w-md">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      proj.role === 'OWNER'
                        ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                        : proj.role === 'ADMIN'
                        ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {proj.role}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                    Joined {new Date(proj.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-zinc-500">
            No projects associated with this account yet.
          </div>
        )}
      </div>
    </div>
  );
}
