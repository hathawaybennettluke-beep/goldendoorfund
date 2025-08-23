// "use client";

// import { useState } from "react";
// import {
//   Bell,
//   CreditCard,
//   Lock,
//   Mail,
//   Shield,
//   User,
//   Eye,
//   EyeOff,
//   Trash2,
//   AlertTriangle,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Switch } from "@/components/ui/switch";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

// // Mock user settings
// const mockSettings = {
//   notifications: {
//     email: true,
//     push: false,
//     donationReminders: true,
//     campaignUpdates: true,
//     newsletter: true,
//     impactReports: true,
//   },
//   privacy: {
//     profileVisibility: "public",
//     showDonationHistory: false,
//     allowContactFromOrganizations: true,
//   },
//   payment: {
//     defaultPaymentMethod: "card_1234",
//     autoSaveMethods: true,
//     currency: "USD",
//   },
//   account: {
//     twoFactorEnabled: false,
//     loginAlerts: true,
//   },
// };

// const paymentMethods = [
//   {
//     id: "card_1234",
//     type: "Credit Card",
//     last4: "1234",
//     brand: "Visa",
//     expiryMonth: 12,
//     expiryYear: 2025,
//   },
//   {
//     id: "card_5678",
//     type: "Credit Card",
//     last4: "5678",
//     brand: "Mastercard",
//     expiryMonth: 8,
//     expiryYear: 2026,
//   },
// ];

// export default function SettingsPage() {
//   const [settings, setSettings] = useState(mockSettings);
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [passwordForm, setPasswordForm] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const updateNotificationSetting = (key: string, value: boolean) => {
//     setSettings((prev) => ({
//       ...prev,
//       notifications: {
//         ...prev.notifications,
//         [key]: value,
//       },
//     }));
//   };

//   const updatePrivacySetting = (key: string, value: string) => {
//     setSettings((prev) => ({
//       ...prev,
//       privacy: {
//         ...prev.privacy,
//         [key]: value,
//       },
//     }));
//   };

//   const updateAccountSetting = (key: string, value: boolean) => {
//     setSettings((prev) => ({
//       ...prev,
//       account: {
//         ...prev.account,
//         [key]: value,
//       },
//     }));
//   };

//   const handlePasswordChange = () => {
//     if (passwordForm.newPassword !== passwordForm.confirmPassword) {
//       alert("New passwords don&apos;t match!");
//       return;
//     }
//     // Here you would typically call your API to change the password
//     console.log("Changing password...");
//     setPasswordForm({
//       currentPassword: "",
//       newPassword: "",
//       confirmPassword: "",
//     });
//   };

//   const handleDeleteAccount = () => {
//     // Here you would typically call your API to delete the account
//     console.log("Deleting account...");
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <section className="py-12 px-10 bg-gradient-to-br from-primary/5 to-primary/10">
//         <div className="container">
//           <div className="max-w-4xl mx-auto">
//             <h1 className="text-4xl font-bold mb-4">Settings</h1>
//             <p className="text-muted-foreground text-lg">
//               Manage your account preferences and security settings
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Main Content */}
//       <section className="py-12 px-10">
//         <div className="container">
//           <div className="max-w-4xl mx-auto space-y-8">
//             {/* Notification Settings */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Bell className="h-5 w-5" />
//                   Notification Preferences
//                 </CardTitle>
//                 <CardDescription>
//                   Choose how you want to be notified about campaigns and updates
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Email Notifications</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Receive notifications via email
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.email}
//                     onCheckedChange={(value: boolean) =>
//                       updateNotificationSetting("email", value)
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Push Notifications</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Receive push notifications on your device
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.push}
//                     onCheckedChange={(value: boolean) =>
//                       updateNotificationSetting("push", value)
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Donation Reminders</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Get reminded about recurring donations
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.donationReminders}
//                     onCheckedChange={(value: boolean) =>
//                       updateNotificationSetting("donationReminders", value)
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Campaign Updates</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Updates from campaigns you&apos;ve supported
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.campaignUpdates}
//                     onCheckedChange={(value: boolean) =>
//                       updateNotificationSetting("campaignUpdates", value)
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Newsletter</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Monthly newsletter with impact stories
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.newsletter}
//                     onCheckedChange={(value: boolean) =>
//                       updateNotificationSetting("newsletter", value)
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Impact Reports</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Quarterly reports on your donation impact
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.impactReports}
//                     onCheckedChange={(value: boolean) =>
//                       updateNotificationSetting("impactReports", value)
//                     }
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Privacy Settings */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Shield className="h-5 w-5" />
//                   Privacy Settings
//                 </CardTitle>
//                 <CardDescription>
//                   Control who can see your information and activity
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div>
//                   <h4 className="font-medium mb-2">Profile Visibility</h4>
//                   <Select
//                     value={settings.privacy.profileVisibility}
//                     onValueChange={(value) =>
//                       updatePrivacySetting("profileVisibility", value)
//                     }
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="public">Public</SelectItem>
//                       <SelectItem value="private">Private</SelectItem>
//                       <SelectItem value="friends">Friends Only</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-sm text-muted-foreground mt-1">
//                     Choose who can view your profile information
//                   </p>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Show Donation History</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Allow others to see your donation activity
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.privacy.showDonationHistory}
//                     onCheckedChange={(value: string) =>
//                       updatePrivacySetting("showDonationHistory", value)
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">
//                       Allow Contact from Organizations
//                     </h4>
//                     <p className="text-sm text-muted-foreground">
//                       Let organizations you&apos;ve supported contact you
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.privacy.allowContactFromOrganizations}
//                     onCheckedChange={(value: string) =>
//                       updatePrivacySetting(
//                         "allowContactFromOrganizations",
//                         value
//                       )
//                     }
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Payment Settings */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <CreditCard className="h-5 w-5" />
//                   Payment Settings
//                 </CardTitle>
//                 <CardDescription>
//                   Manage your payment methods and preferences
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div>
//                   <h4 className="font-medium mb-4">Saved Payment Methods</h4>
//                   <div className="space-y-3">
//                     {paymentMethods.map((method) => (
//                       <div
//                         key={method.id}
//                         className="flex items-center justify-between p-4 border rounded-lg"
//                       >
//                         <div className="flex items-center gap-3">
//                           <CreditCard className="h-5 w-5 text-muted-foreground" />
//                           <div>
//                             <p className="font-medium">
//                               {method.brand} •••• {method.last4}
//                             </p>
//                             <p className="text-sm text-muted-foreground">
//                               Expires {method.expiryMonth}/{method.expiryYear}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex gap-2">
//                           {settings.payment.defaultPaymentMethod ===
//                             method.id && (
//                             <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
//                               Default
//                             </span>
//                           )}
//                           <Button variant="outline" size="sm">
//                             Edit
//                           </Button>
//                           <Button variant="outline" size="sm">
//                             Remove
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   <Button variant="outline" className="mt-4">
//                     Add New Payment Method
//                   </Button>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Auto-save Payment Methods</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Automatically save new payment methods for future use
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.payment.autoSaveMethods}
//                     onCheckedChange={(value: boolean) =>
//                       setSettings((prev) => ({
//                         ...prev,
//                         payment: { ...prev.payment, autoSaveMethods: value },
//                       }))
//                     }
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Security Settings */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Lock className="h-5 w-5" />
//                   Security Settings
//                 </CardTitle>
//                 <CardDescription>
//                   Keep your account secure with these settings
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Two-Factor Authentication</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Add an extra layer of security to your account
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.account.twoFactorEnabled}
//                     onCheckedChange={(value: boolean) =>
//                       updateAccountSetting("twoFactorEnabled", value)
//                     }
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Login Alerts</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Get notified when someone logs into your account
//                     </p>
//                   </div>
//                   <Switch
//                     checked={settings.account.loginAlerts}
//                     onCheckedChange={(value: boolean) =>
//                       updateAccountSetting("loginAlerts", value)
//                     }
//                   />
//                 </div>

//                 {/* Change Password */}
//                 <div className="border-t pt-6">
//                   <h4 className="font-medium mb-4">Change Password</h4>
//                   <div className="space-y-4 max-w-md">
//                     <div>
//                       <label className="text-sm font-medium mb-2 block">
//                         Current Password
//                       </label>
//                       <div className="relative">
//                         <Input
//                           type={showCurrentPassword ? "text" : "password"}
//                           value={passwordForm.currentPassword}
//                           onChange={(e) =>
//                             setPasswordForm((prev) => ({
//                               ...prev,
//                               currentPassword: e.target.value,
//                             }))
//                           }
//                         />
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="sm"
//                           className="absolute right-0 top-0 h-full px-3"
//                           onClick={() =>
//                             setShowCurrentPassword(!showCurrentPassword)
//                           }
//                         >
//                           {showCurrentPassword ? (
//                             <EyeOff className="h-4 w-4" />
//                           ) : (
//                             <Eye className="h-4 w-4" />
//                           )}
//                         </Button>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="text-sm font-medium mb-2 block">
//                         New Password
//                       </label>
//                       <div className="relative">
//                         <Input
//                           type={showNewPassword ? "text" : "password"}
//                           value={passwordForm.newPassword}
//                           onChange={(e) =>
//                             setPasswordForm((prev) => ({
//                               ...prev,
//                               newPassword: e.target.value,
//                             }))
//                           }
//                         />
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="sm"
//                           className="absolute right-0 top-0 h-full px-3"
//                           onClick={() => setShowNewPassword(!showNewPassword)}
//                         >
//                           {showNewPassword ? (
//                             <EyeOff className="h-4 w-4" />
//                           ) : (
//                             <Eye className="h-4 w-4" />
//                           )}
//                         </Button>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="text-sm font-medium mb-2 block">
//                         Confirm New Password
//                       </label>
//                       <div className="relative">
//                         <Input
//                           type={showConfirmPassword ? "text" : "password"}
//                           value={passwordForm.confirmPassword}
//                           onChange={(e) =>
//                             setPasswordForm((prev) => ({
//                               ...prev,
//                               confirmPassword: e.target.value,
//                             }))
//                           }
//                         />
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="sm"
//                           className="absolute right-0 top-0 h-full px-3"
//                           onClick={() =>
//                             setShowConfirmPassword(!showConfirmPassword)
//                           }
//                         >
//                           {showConfirmPassword ? (
//                             <EyeOff className="h-4 w-4" />
//                           ) : (
//                             <Eye className="h-4 w-4" />
//                           )}
//                         </Button>
//                       </div>
//                     </div>

//                     <Button onClick={handlePasswordChange}>
//                       Update Password
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Danger Zone */}
//             <Card className="border-destructive/50">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2 text-destructive">
//                   <AlertTriangle className="h-5 w-5" />
//                   Danger Zone
//                 </CardTitle>
//                 <CardDescription>
//                   Irreversible actions that will permanently affect your account
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
//                   <div>
//                     <h4 className="font-medium text-destructive">
//                       Delete Account
//                     </h4>
//                     <p className="text-sm text-muted-foreground">
//                       Permanently delete your account and all associated data
//                     </p>
//                   </div>
//                   <AlertDialog>
//                     <AlertDialogTrigger asChild>
//                       <Button variant="destructive">
//                         <Trash2 className="mr-2 h-4 w-4" />
//                         Delete Account
//                       </Button>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent>
//                       <AlertDialogHeader>
//                         <AlertDialogTitle>
//                           Are you absolutely sure?
//                         </AlertDialogTitle>
//                         <AlertDialogDescription>
//                           This action cannot be undone. This will permanently
//                           delete your account and remove all your data from our
//                           servers, including your donation history and profile
//                           information.
//                         </AlertDialogDescription>
//                       </AlertDialogHeader>
//                       <AlertDialogFooter>
//                         <AlertDialogCancel>Cancel</AlertDialogCancel>
//                         <AlertDialogAction
//                           onClick={handleDeleteAccount}
//                           className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                         >
//                           Yes, delete my account
//                         </AlertDialogAction>
//                       </AlertDialogFooter>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

export default function SettingPage() {
  return <div>Setting Page</div>;
}
