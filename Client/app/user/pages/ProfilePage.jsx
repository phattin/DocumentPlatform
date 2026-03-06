import React, { useState } from 'react';
import { User, Mail, Calendar, FileText, Download, Star, Settings, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../user/components/button';
import { Input } from '../../user/components/input';
import { Label } from '../../user/components/label';
import { Avatar, AvatarFallback } from '../../user/components/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../user/components/tabs';
import { Badge } from '../../user/components/badge';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    joinDate: '15/10/2024',
    bio: 'Sinh viên năm 3 chuyên ngành Công nghệ Thông tin. Yêu thích chia sẻ kiến thức và học hỏi từ cộng đồng.',
  });

  const stats = [
    { label: 'Tài liệu đã tải', value: '24', icon: FileText },
    { label: 'Lượt tải xuống', value: '5.2K', icon: Download },
    { label: 'Đánh giá trung bình', value: '4.8', icon: Star },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'upload',
      title: 'Đã tải lên "Giáo trình Toán Cao Cấp A1"',
      date: '2 ngày trước',
    },
    {
      id: 2,
      type: 'comment',
      title: 'Đã bình luận vào "Lập trình Java"',
      date: '5 ngày trước',
    },
    {
      id: 3,
      type: 'download',
      title: 'Đã tải "Cấu trúc dữ liệu"',
      date: '1 tuần trước',
    },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    console.log('Save profile:', profile);
  };

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
                  <AvatarFallback>NVA</AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-slate-400 hover:text-white"
                  data-testid="change-avatar-btn"
                >
                  Thay đổi ảnh
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2" data-testid="profile-name">
                      {profile.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" strokeWidth={1.5} />
                        <span>{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" strokeWidth={1.5} />
                        <span>Tham gia: {profile.joinDate}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => setIsEditing(!isEditing)}
                    data-testid="edit-profile-btn"
                  >
                    <Edit2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Chỉnh sửa
                  </Button>
                </div>

                <p className="text-slate-300 leading-relaxed mb-6" data-testid="profile-bio">
                  {profile.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="bg-white/5 rounded-2xl p-4 text-center"
                        data-testid={`stat-${index}`}
                      >
                        <Icon className="w-6 h-6 text-primary mx-auto mb-2" strokeWidth={1.5} />
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
              <TabsTrigger
                value="activity"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                data-testid="tab-activity"
              >
                Hoạt động
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                data-testid="tab-settings"
              >
                Cài đặt
              </TabsTrigger>
            </TabsList>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <div className="glass-panel rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6" data-testid="activity-heading">Hoạt động gần đây</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      data-testid={`activity-${index}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">{activity.title}</p>
                        <p className="text-sm text-slate-400">{activity.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="glass-panel rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-6" data-testid="settings-heading">Cài đặt tài khoản</h2>

                {isEditing ? (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">
                        Họ và tên
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="h-12 glass-input rounded-xl text-white"
                        data-testid="edit-name-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="h-12 glass-input rounded-xl text-white"
                        data-testid="edit-email-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-slate-300">
                        Giới thiệu
                      </Label>
                      <Input
                        id="bio"
                        type="text"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="h-12 glass-input rounded-xl text-white"
                        data-testid="edit-bio-input"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        className="rounded-full bg-primary hover:bg-primary/90 px-8"
                        data-testid="save-profile-btn"
                      >
                        Lưu thay đổi
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => setIsEditing(false)}
                        data-testid="cancel-edit-btn"
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-sm text-slate-400 mb-1">Họ và tên</p>
                      <p className="font-medium">{profile.name}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-sm text-slate-400 mb-1">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-sm text-slate-400 mb-1">Giới thiệu</p>
                      <p className="font-medium">{profile.bio}</p>
                    </div>

                    <Button
                      variant="outline"
                      className="rounded-full border-white/10"
                      onClick={() => setIsEditing(true)}
                      data-testid="start-edit-btn"
                    >
                      <Settings className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Chỉnh sửa thông tin
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;