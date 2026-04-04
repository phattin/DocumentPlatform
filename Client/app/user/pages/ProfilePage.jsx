import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Calendar, FileText, Download, Star, Edit2, ArrowUp, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../user/components/button';
import { Input } from '../../user/components/input';
import { Label } from '../../user/components/label';
import { Avatar, AvatarFallback } from '../../user/components/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../user/components/tabs';
import { storage, db, auth } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  doc, updateDoc, getDoc, getDocs,
  collection, query, where, orderBy, limit
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();

  // ✅ targetUid: nếu có id trên URL thì xem người đó, không thì xem chính mình
  const targetUid = id || user?.uid;

  // ✅ isOwner: chỉ true khi xem profile của chính mình
  const isOwner = !id || id === user?.uid;

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: '', email: '', joinDate: '', bio: '', avatar: '',
  });

  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalDownloads: 0,
    averageRating: null,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  const formatTimeAgo = (date) => {
    const diffMs = new Date() - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  useEffect(() => {
    if (!targetUid) return;

    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', targetUid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            name: data.name || '',
            email: data.email || '',
            avatar: data.avatar || '',
            bio: data.bio || '',
            joinDate: data.createdAt
              ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('vi-VN')
              : '',
          });
        }

        const docsSnap = await getDocs(
          query(collection(db, 'documents'), where('authorId', '==', targetUid))
        );

        const totalDocuments = docsSnap.size;
        let totalDownloads = 0;
        let totalRating = 0;
        let totalRatingCount = 0;

        docsSnap.docs.forEach((d) => {
          const data = d.data();
          totalDownloads += data.downloads || 0;
          totalRating += data.ratingTotal || 0;
          totalRatingCount += data.ratingCount || 0;
        });

        setStats({
          totalDocuments,
          totalDownloads,
          averageRating: totalRatingCount > 0
            ? (totalRating / totalRatingCount).toFixed(1)
            : null,
        });

        // ✅ Chỉ load activity của chính mình
        if (isOwner) {
          const activitySnap = await getDocs(
            query(
              collection(db, 'activityLogs'),
              where('userId', '==', targetUid),
              orderBy('createdAt', 'desc'),
              limit(10)
            )
          );

          const activities = activitySnap.docs.map((d) => ({
            id: d.id,
            type: d.data().type,
            title: d.data().title,
            date: formatTimeAgo(d.data().createdAt?.toDate() || new Date()),
          }));

          setRecentActivity(activities);
        }

      } catch (error) {
        console.error('Load profile error:', error);
      }
    };

    loadProfile();
  }, [targetUid]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, avatar: preview }));
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: downloadURL });
      await updateDoc(doc(db, 'users', user.uid), { avatar: downloadURL });
      setProfile((prev) => ({ ...prev, avatar: downloadURL }));
    } catch (error) {
      console.error('Upload avatar error:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(user, { displayName: profile.name });
      await updateDoc(doc(db, 'users', user.uid), {
        name: profile.name,
        bio: profile.bio,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
    }
  };

  const activityIcon = (type) => {
    if (type === 'upload') return <ArrowUp className="w-5 h-5 text-primary" />;
    if (type === 'comment') return <MessageSquare className="w-5 h-5 text-yellow-400" />;
    if (type === 'download') return <Download className="w-5 h-5 text-emerald-400" />;
    return <FileText className="w-5 h-5 text-primary" />;
  };

  const activityBg = (type) => {
    if (type === 'upload') return 'bg-primary/20';
    if (type === 'comment') return 'bg-yellow-400/20';
    if (type === 'download') return 'bg-emerald-400/20';
    return 'bg-primary/20';
  };

  const statItems = [
    {
      label: 'Tài liệu đã tải',
      value: stats.totalDocuments.toLocaleString(),
      icon: FileText,
    },
    {
      label: 'Lượt tải xuống',
      value: stats.totalDownloads >= 1000
        ? `${(stats.totalDownloads / 1000).toFixed(1)}K`
        : stats.totalDownloads.toLocaleString(),
      icon: Download,
    },
    {
      label: 'Đánh giá trung bình',
      value: stats.averageRating ?? 'Chưa có',
      icon: Star,
    },
  ];

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Header */}
          <div className="glass-panel rounded-3xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 bg-primary/20 text-primary text-4xl">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <AvatarFallback>
                      {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>

                {/* ✅ Chỉ hiện nút thay ảnh khi là chủ profile */}
                {isOwner && (
                  <>
                    <input type="file" accept="image/*" id="avatarUpload" className="hidden" onChange={handleAvatarChange} />
                    <Button
                      variant="ghost" size="sm"
                      className="rounded-full text-slate-400 hover:text-white"
                      onClick={() => document.getElementById('avatarUpload').click()}
                    >
                      Thay đổi ảnh
                    </Button>
                  </>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.name || 'Chưa có tên'}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Tham gia: {profile.joinDate || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Chỉ hiện nút chỉnh sửa khi là chủ profile */}
                  {isOwner && (
                    <Button variant="ghost" className="rounded-full" onClick={() => setIsEditing(!isEditing)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>

                <p className="text-slate-300 leading-relaxed mb-6">
                  {profile.bio || 'Chưa có giới thiệu'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {statItems.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="bg-white/5 rounded-2xl p-4 text-center">
                        <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold mb-1">{stat.value}</p>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="glass-panel h-12 p-1 mb-8">
              <TabsTrigger value="activity" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                Hoạt động
              </TabsTrigger>
              {/* ✅ Chỉ hiện tab Cài đặt khi là chủ profile */}
              {isOwner && (
                <TabsTrigger value="settings" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                  Cài đặt
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="activity">
              <div className="glass-panel rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6">Hoạt động gần đây</h2>
                <div className="space-y-4">
                  {isOwner ? (
                    recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 rounded-xl bg-white/5"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activityBg(activity.type)}`}>
                            {activityIcon(activity.type)}
                          </div>
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-slate-400">{activity.date}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-slate-500 py-8">Chưa có hoạt động nào</p>
                    )
                  ) : (
                    // ✅ Khi xem profile người khác, ẩn activity
                    <p className="text-center text-slate-500 py-8">
                      Hoạt động cá nhân không được hiển thị công khai
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ✅ Chỉ render tab Cài đặt khi là chủ profile */}
            {isOwner && (
              <TabsContent value="settings">
                <div className="glass-panel rounded-3xl p-8">
                  <h2 className="text-xl font-bold mb-6">Cài đặt tài khoản</h2>
                  {isEditing ? (
                    <form onSubmit={handleSave} className="space-y-6">
                      <div>
                        <Label>Họ và tên</Label>
                        <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={profile.email} disabled />
                      </div>
                      <div>
                        <Label>Giới thiệu</Label>
                        <Input value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                      </div>
                      <div className="flex gap-4">
                        <Button type="submit">Lưu</Button>
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Họ và tên</p>
                        <p className="font-medium">{profile.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Email</p>
                        <p className="font-medium">{profile.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Giới thiệu</p>
                        <p className="font-medium">{profile.bio || 'Chưa có giới thiệu'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;