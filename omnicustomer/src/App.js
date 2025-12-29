import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginFallbackUI from './common/LoginFallbackUI';
import FallbackUI from './common/FallbackUI';
import PrivateRoutes from './common/PrivateRoutes';

// Lazy load components
const Login = lazy(() => import('./pages/Login/Login'));
const Signup = lazy(() => import('./pages/Signup/Signup'));
const PendingInvitation = lazy(() => import('./pages/PendingInvitation/InvitationRegister'));
const WorkSpace = lazy(() => import('./pages/WorkSpace/WorkSpace'));
const LandingWorkSpace = lazy(() => import('./pages/WorkSpace/LandingWorkSpace'));
const ComingSoon = lazy(() => import('./common/ComingSoon'));
const Payment = lazy(() => import('./pages/Whatsapp/Payments/Payment'));
const Support = lazy(() => import('./pages/Whatsapp/Support/Support'));
const Settings = lazy(() => import('./pages/Whatsapp/Settings/Settings'));
const Templates = lazy(() => import('./pages/Whatsapp/Broadcast/Templates'));
const Dashboard = lazy(() => import('./pages/Whatsapp/Dashboard'));
const AllContacts = lazy(() => import('./pages/Whatsapp/Contacts/AllContacts'));
const Groups = lazy(() => import('./pages/Whatsapp/Contacts/Groups'));
const Optout = lazy(() => import('./pages/Whatsapp/Contacts/OptOut'));
const ChatBot = lazy(() => import('./pages/Whatsapp/Chatbots/ChatBot'));
const CreateChatBot = lazy(() => import('./pages/Whatsapp/Chatbots/CreateChatBot'));
const EditChatBot = lazy(() => import('./pages/Whatsapp/Chatbots/EditChatBot'));
const Automation = lazy(() => import('./pages/Whatsapp/Chatbots/Automation'));
const WAInbox = lazy(() => import('./pages/Whatsapp/Broadcast/WAInbox'));
const ScheduleBroadcast = lazy(() => import('./pages/Whatsapp/Broadcast/ScheduleBroadcast'));
const BroadcastHistory = lazy(() => import('./pages/Whatsapp/Broadcast/BroadcastHistory'));
const Analytics = lazy(() => import('./pages/Whatsapp/Analytics/Analytics'));
const Compose = lazy(() => import('./pages/SMS/Messages/Compose'));
const SmsInbox = lazy(() => import('./pages/SMS/Messages/SmsInbox'));
const Template = lazy(() => import('./pages/SMS/Messages/Template'));
const ManageUsers = lazy(() => import('./pages/Profile/ManageUsers'));
const MyNumber = lazy(() => import('./pages/SMS/MyNumbers/my_number'));
const OrderNumbers = lazy(() => import('./pages/SMS/MyNumbers/OrderNumbers'));
// const Brands = lazy(() => import('./pages/SMS/CampaignRegistry/Brands'));
// const Campaign = lazy(() => import('./pages/SMS/CampaignRegistry/Campaign'));
const CampaignRegistry = lazy(() => import('./pages/SMS/CampaignRegistry/CampaignRegistry'));
const Brands = lazy(() => import('./pages/SMS/CampaignRegistry/Brands'));
const Campaign = lazy(() => import('./pages/SMS/CampaignRegistry/Campaign'));

const LoginDashboard = lazy(() => import('./pages/Dashboard/dashboard'));
const Instagram = lazy(() => import('./pages/Instagram/Instagram'));
const InstagramSettings = lazy(() => import('./pages/Instagram/InstagramSettings'));
const ListView = lazy(() => import('./pages/ListView/ListView'));
const FeedView = lazy(() => import('./pages/ListView/FeedView'));

const ChangePassword = lazy(() => import('./pages/Login/ChangePassword'));
const FaceBook = lazy(() => import('./pages/FaceBook/FaceBook'));
const YouTube = lazy(() => import("./pages/YouTube/YouTube"));
const Telegram_dashboard = lazy(() => import("./pages/Telegram/Telegram_dashboard"));
const Telegram_Communities = lazy(() => import("./pages/Telegram/Settings/Communties"));
const TelegramTemplates = lazy(() => import("./pages/Telegram/Settings/BroadCastTemplates"));
const TelegramPermissions = lazy(() => import("./pages/Telegram/Settings/Telegram_Permissions"));
const TelegramChannel = lazy(() => import("./pages/Telegram/Boardcast/TelagramChannels"));
const TelegramGroups = lazy(() => import("./pages/Telegram/Boardcast/TelagramGroups"));
const TelegramHistory = lazy(() => import("./pages/Telegram/Boardcast/TelagramHistory"));
const TelegramScheduleBroadCast = lazy(() => import("./pages/Telegram/Boardcast/telegramScheduledBroadcast"));
const FacebookSettings = lazy(() => import("./pages/FaceBook/FacebookSettings"));
const YouTubeSettings = lazy(() => import('./pages/YouTube/YouTubeSetting'));
const CalenderView = lazy(() => import("./pages/ListView/CalenderView"));
// const PreviewView = lazy(() => import("./pages/Compose/PreviewView"));
// const PinterestProfile = lazy(() => import("./pages/Pinterset/PinterestProfile"));
// const PinterestView = lazy(() => import("./pages/Pinterset/PintersetView"));
const PinterestProfile = lazy(() => import("./pages/Pinterset/PinterestProfile"));
const PreviewView = lazy(() => import("./pages/Compose/PreviewView"));
const PinterestView = lazy(() => import("./pages/Pinterset/PintersetView"));
const PinterestSettings = lazy(() => import("./pages/Pinterset/PinterestSettings"));
const LinkedInProfile = lazy(() => import("./pages/LinkedIn/LinkedInProfile"));
const AddPageWorkspace = lazy(() => import("./pages/AddPageWorkspace/AddPageWorkspace"));
const LinkedInSettings = lazy(() => import("./pages/LinkedIn/LinkedInSettings"));
const LoginTest = lazy(() => import("./pages/Login/LoginTest"));
const DeveloperApi = lazy(() => import("./pages/DeveloperApi/DeveloperApi"));
const ProfilePage = lazy(() => import("./pages/ProfilePage/ProfilePage"));
const IpAddress = lazy(() => import("./pages/IpAddress/IpAddress"));


function App() {
  return (
    <div className="App">
      <Router>

        {/* Public Routes with LoginFallbackUI */}
        <Suspense fallback={<LoginFallbackUI />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/Invitation_register" element={<PendingInvitation />} />
          </Routes>
        </Suspense>

        {/* Private Routes with FallbackUI */}
        <Suspense fallback={<FallbackUI />}>
          <Routes>
            {/* Private Routes without Layout */}
            <Route element={<PrivateRoutes />}>
              <Route path="/workspace" element={<WorkSpace />} />
              <Route path="/api_documentation" element={<DeveloperApi />} />
              <Route path="/profilepage" element={<ProfilePage />} />
              <Route path="/2FA" element={<IpAddress />} />

              <Route exact path="/add-page-workspace" element={<AddPageWorkspace />} />
              <Route path="/manage_users" element={<ManageUsers />} />

              <Route path="/landing" element={<LandingWorkSpace />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/payment" element={<Payment />} />
              <Route exact path="/support-ticket" element={<Support />} />
            </Route>

            {/* Private Routes with Layout */}
            <Route element={<PrivateRoutes withLayout={true} />}>
              <Route path="/whatsapp/settings" element={<Settings />} />
              {/* <Route path="/whatsapp/templates" element={<Templates />} /> */}
              <Route path="/whatsapp" element={<Dashboard />} />
              <Route path="/contacts" element={<AllContacts />} />
              <Route path="/contacts/allcontacts" element={<AllContacts />} />
              <Route path="/contacts/groups" element={<Groups />} />
              <Route path="/whatsapp/optout" element={<Optout />} />
              <Route path="/whatsapp/chatbot/chatbot" element={<ChatBot />} />
              <Route path="/whatsapp/chatbot/create_chatbot" element={<CreateChatBot />} />
              <Route path="/whatsapp/chatbot/edit_chatbot" element={<EditChatBot />} />
              <Route exact path="/whatsapp/chatbot/automation" element={<Automation />} />
              <Route exact path="/whatsapp/broadcast/templates" element={<Templates />} />
              <Route exact path="/whatsapp/broadcast/inbox" element={<WAInbox />} />
              <Route exact path="/whatsapp/broadcast/schedule_broadcast" element={<ScheduleBroadcast />} />
              <Route exact path="/whatsapp/broadcast/broadcast_history" element={<BroadcastHistory />} />
              <Route exact path="/whatsapp/analytics" element={<Analytics />} />
              <Route exact path="/sms" element={<Compose />} />
              <Route exact path="/sms/messages/compose" element={<Compose />} />
              <Route exact path="/sms/messages/inbox" element={<SmsInbox key="inbox" type="IN" />} />
              <Route exact path="/sms/messages/sent_items" element={<SmsInbox key="sent_items" type="OUT" />} />
              <Route exact path="/sms/messages/history" element={<SmsInbox key="history" type="ALL" />} />
              <Route exact path="/sms/messages/template" element={<Template />} />
              {/* <Route exact path="/sms/campaign_registry/brands" element={<Brands />} />
              <Route exact path="/sms/campaign_registry/campaign" element={<Campaign />} /> */}
              <Route path="/comingsoon" element={<ComingSoon />} />
              <Route path="/changepassword" element={<ChangePassword />} />
              {/* <Route path="/manage_users" element={<ManageUsers />} /> */}
              <Route exact path="/sms/order_numbers" element={<OrderNumbers />} />
              <Route exact path="/sms/my_number" element={<MyNumber />} />
              <Route exact path="/dashboard" element={<LoginDashboard />} />
              <Route path="/instagram/profile" element={<Instagram />} />
              <Route path="/instagram/settings" element={<InstagramSettings />} />
              <Route path="/listview" element={<ListView />} />
              <Route path="/feedview" element={<FeedView />} />
              <Route path="/facebook/profile" element={<FaceBook />} />
              <Route path="/youtube/profile" element={<YouTube />} />
              <Route path="/telegram/telegram_dashboard" element={<Telegram_dashboard />} />
              <Route path="/telegram/setting/communities" element={<Telegram_Communities />} />
              <Route path="/telegram/setting/broadcast_templates" element={<TelegramTemplates />} />
              <Route path="/telegram/setting/telegram_permissions" element={<TelegramPermissions />} />
              <Route path="/telegram/channel" element={<TelegramChannel />} />
              <Route path="/telegram/group" element={<TelegramGroups />} />
              <Route path="/telegram/history" element={<TelegramHistory />} />
              <Route path="/telegram/schedule_broadcast" element={<TelegramScheduleBroadCast />} />
              <Route path="/facebook/settings" element={<FacebookSettings />} />
              <Route path="/youtube/settings" element={<YouTubeSettings />} />
              <Route path="/calenderview" element={<CalenderView />} />
              {/* <Route path="/pinterest/profile" element={<PinterestProfile />} />
              <Route path="/pinterest-view" element={<PinterestView />} /> */}
              <Route path="/pinterest-view" element={<PinterestView />} />
              <Route path='/pinterest/profile' element={<PinterestProfile />} />
              <Route path='/pintrest_view/:id' element={<PinterestView />} />
              <Route path="/pinterest/settings" element={<PinterestSettings />} />

              <Route path="/pinterest/settings" element={<PinterestSettings />} />
              <Route exact path="/sms/campaign_registry/brands" element={<Brands />} />
              <Route exact path="/sms/campaign_registry/campaign" element={<Campaign />} />
              <Route exact path="/sms/campaign_registry/campaignregistry" element={<CampaignRegistry />} />
              <Route extact path="/linkedin/profile" element={<LinkedInProfile />} />
              <Route path="/linkedin/settings" element={<LinkedInSettings />} />
            </Route>
            <Route path="/preview" element={<PreviewView />} />
            <Route exact path="/test_login" element={<LoginTest />} />

          </Routes>

        </Suspense>
      </Router>
    </div>
  );
}

export default App;
