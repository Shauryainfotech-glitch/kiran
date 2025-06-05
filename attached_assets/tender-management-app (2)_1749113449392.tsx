import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, Users, FileText, Search, Filter, Plus, Download, Upload, Eye, Edit, Trash2, Clock, DollarSign, TrendingUp, Award, CheckCircle, XCircle, AlertCircle, Bell, Settings, User, LogOut, Menu, X, ChevronDown, ChevronRight, Building, MapPin, Phone, Mail, Globe, Star, Heart, Share2, Copy, Printer, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';

const TenderManagementApp = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTender, setSelectedTender] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('fresh');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Comprehensive Dashboard Data
  const dashboardStats = {
    freshTenders: 0,
    liveTenders: 55,
    tenderResults: 199,
    submittedTenders: 59,
    myTenders: 10,
    inProcessTenders: 10,
    assignedToTeam: 38
  };

  // Detailed Finance Data
  const financeStats = {
    emdPayment: { paid: 4318026301, refund: 848579 },
    sdPayment: { paid: 0, refund: 0 },
    emdUnderProcess: 3000000,
    emdForfeited: 0,
    sdForfeited: 0,
    expired: { emd: 2270974427, sd: 0 },
    newRequests: { 
      bankGuarantee: 10000, 
      securityDeposit: 0, 
      fees: 13668277, 
      others: 0,
      emd: 343244
    },
    usedRequests: { 
      bankGuarantee: 0, 
      securityDeposit: 0, 
      fees: 14785, 
      others: 0,
      emd: 340988
    }
  };

  // Detailed Tender Data
  const sampleTenders = [
    {
      id: 86964458,
      title: "Request for proposal (RfP) for appointment of general consultant for office of the chief administrative officer/construction, eastern railway/kolkata",
      organization: "Eastern Railway - Kolkata, West Bengal, India",
      value: 984200,
      status: "Submitted",
      type: "BSPTL",
      dueDate: "16-04-2025",
      submissionDate: "08-04-2025",
      location: "Kolkata",
      department: "Eastern Railway",
      ownership: "Central Government",
      tenderId: 12505,
      estimatedCost: "₹ 98.42 Lakh",
      documentFees: "₹ 10.00 Thousand",
      emdValue: "₹ 2.68 Lakh",
      startDate: "16-04-2025",
      lastDate: "16-04-2025",
      openingDate: "16-04-2025"
    },
    {
      id: 468500,
      title: "Supply of passenger train building - I fixed length",
      organization: "Planning And Development Department - Jharkhand, Bihar, India",
      value: 468500,
      status: "In Process",
      type: "BSPTL",
      dueDate: "02-04-2025",
      submissionDate: "08-04-2025",
      location: "Bihar",
      department: "Planning And Development Department",
      ownership: "State Government",
      tenderId: 23800,
      estimatedCost: "₹ 46.85 Lakh",
      documentFees: "₹ 5.00 Thousand",
      emdValue: "₹ 1.25 Lakh"
    },
    {
      id: 6469,
      title: "Refer Document",
      organization: "North Eastern Railways - Tezmapur, Uttar Pradesh, India",
      value: 0,
      status: "In Process",
      type: "BSPTL",
      dueDate: "17-04-2025",
      submissionDate: "08-04-2025",
      location: "Uttar Pradesh",
      tenderId: 6469
    }
  ];

  // Today's Activities
  const todayActivities = [
    { 
      id: 6500, 
      assignee: "Yogesh Gadhavi", 
      assignBy: "Palak Shah",
      dueDate: "08-04-2025 18:43", 
      submissionDate: "08-04-2025",
      status: "Assigned"
    },
    { 
      id: 6500, 
      assignee: "Vinisha Patel", 
      assignBy: "Palak Shah",
      dueDate: "02-04-2025 18:04", 
      submissionDate: "08-04-2025",
      status: "In Progress"
    },
    { 
      id: 6500, 
      assignee: "Palak Shah", 
      assignBy: "Admin",
      dueDate: "02-04-2025 18:04", 
      submissionDate: "08-04-2025",
      status: "Completed"
    }
  ];

  // BOQ Search Results
  const boqResults = [
    {
      id: 53094271,
      submissionDate: "09-04-2025",
      tenderValue: "₹ 6.44 Cr",
      t247Id: 86964458,
      description: "Office Revolving Chair 18''x21'' Capsule Medium Back Type",
      quantity: "2.00 Each",
      category: "₹ Refer Docs",
      location: "Koderma, Jharkhand, India"
    },
    {
      id: 53881909,
      submissionDate: "09-04-2025",
      tenderValue: "₹ Refer Docs",
      t247Id: 86989217,
      description: "Providing And Fixing Kitchen Sink With C.I. Brackets, C.P. Brass Chain With Rubber Plug, 40 Mm C.P. Brass Waste Complete, Including Painting The Fittings And Brackets, Cutting And Making Good The Walls Wherever Required. 17.3 White Glazed Fire Clay Kitchen Sink Of Size 600×450x250 Mm - Executive Chair High Back Mesh Chair In Black Colour With Matte Finish Specification",
      quantity: "1.00 Nos",
      category: "₹ 15.46 K",
      location: "Mysore, Karnataka, India"
    }
  ];

  // Company Profiles for Competitor Analysis
  const companyProfiles = [
    {
      name: "Geeken Seating Collection Private Limited",
      participatedTenders: 307,
      awardedTenders: 65,
      lostTenders: 140,
      l1Bids: 9,
      financialBids: 78,
      technicalBids: 14,
      totalValue: {
        participated: "₹ 440.38 Cr",
        awarded: "₹ 40.59 Cr",
        lost: "₹ 294.56 Cr",
        l1: "₹ 8.34 Cr",
        financial: "₹ 44.65 Cr",
        technical: "₹ 46.57 Cr"
      },
      stateWiseResults: [
        { state: "Uttar Pradesh", published: 335638, participated: 51, awarded: 7 },
        { state: "Haryana", published: 91269, participated: 37, awarded: 8 },
        { state: "Delhi", published: 81727, participated: 33, awarded: 0 },
        { state: "Jharkhand", published: 58810, participated: 36, awarded: 1 },
        { state: "Madhya Pradesh", published: 117568, participated: 27, awarded: 6 },
        { state: "Assam", published: 44820, participated: 22, awarded: 0 },
        { state: "Gujarat", published: 54836, participated: 20, awarded: 0 }
      ]
    },
    {
      name: "Nilkamal Limited",
      participatedTenders: 641,
      awardedTenders: 88,
      lostTenders: 188,
      l1Bids: 71,
      financialBids: 306,
      technicalBids: 63,
      totalValue: {
        participated: "₹ 472.74 Cr",
        awarded: "₹ 29.72 Cr",
        lost: "₹ 180.29 Cr",
        l1: "₹ 24.63 Cr",
        financial: "₹ 103.87 Cr",
        technical: "₹ 172.41 Cr"
      }
    }
  ];

  // Finance Management Data
  const financeTransactions = [
    { id: 13044, organization: "South Eastern Railway", paymentDate: "08-04-2025 12:00:00", type: "EMD", mode: "Offline", amount: 50000, favour: "Manish Aavanti", enteredBy: "Manish Aavanti", status: "Paid" },
    { id: 9920, organization: "Education Department", paymentDate: "08-04-2025 12:00:00", type: "EMD", mode: "Offline", amount: 120000, favour: "Air Force", enteredBy: "Palak Shah", status: "Refund" },
    { id: 6763, organization: "South Central Railway", paymentDate: "08-04-2025 12:00:00", type: "EMD", mode: "Online", amount: 50000, favour: "ISTPL", enteredBy: "Samarth Patel", status: "Paid" },
    { id: 6814, organization: "North Eastern Railways", paymentDate: "08-04-2025 06:00:00", type: "EMD", mode: "Offline", amount: 300000, favour: "Department", enteredBy: "Palak Shah", status: "Paid" },
    { id: 9920, organization: "Education Department", paymentDate: "05-04-2025 12:00:00", type: "EMD", mode: "Offline", amount: 800000, favour: "Indian Army", enteredBy: "Palak Shah", status: "Paid" }
  ];

  // Sales MIS Data
  const salesMISData = [
    { userName: "Abc Zdc", assigned: 0, inProcess: 0, submitted: 0, cancelled: 0, awarded: 0, lost: 0, rejected: 0, dropped: 0, reopened: 0, totalTender: 0 },
    { userName: "Ashfaque Construction", assigned: 0, inProcess: 0, submitted: 0, cancelled: 0, awarded: 0, lost: 0, rejected: 0, dropped: 0, reopened: 0, totalTender: 0 },
    { userName: "Akash Kumar", assigned: 0, inProcess: 0, submitted: 0, cancelled: 0, awarded: 0, lost: 0, rejected: 0, dropped: 0, reopened: 0, totalTender: 0 }
  ];

  // Document Management Data
  const documentBriefCase = [
    { id: 1, folderName: "04-04-2024", subFolderName: "-", fileName: "-", createdBy: "Palak Shah", createdDate: "04-04-2024 14:36", expiryDate: "30-04-2025", remarks: "test" },
    { id: 2, folderName: "Company General Documents", subFolderName: "-", fileName: "Company_Cert.jpg", createdBy: "Palak Shah", createdDate: "03-04-2024 17:50", expiryDate: "20-06-2025", remarks: "k" },
    { id: 3, folderName: "Vishalo_323469", subFolderName: "-", fileName: "Vishalo_Test.Pdf", createdBy: "Palak Shah", createdDate: "02-04-2024 15:49", expiryDate: "30-04-2025", remarks: "Test" }
  ];

  // Task Management Data
  const taskData = [
    { tenderId: 6702, tenderName: "Purchase Of Open Gym In Outdoor Stadium, Gujarat An...", clientName: "Education Department", location: "Gujarat", dueDate: "07-04-2025 19:15", taskWork: "EMD", assigneeName: "Palak Shah", assignerName: "Palak Shah", createdDate: "04-04-2025 13:58", deadline: "07-04-2025 12:00", status: "Under Process" },
    { tenderId: 6763, tenderName: "Supply Of Centrifuge Air Station (as Filter) New...", clientName: "South Central Railway", location: "Andhra Pradesh", dueDate: "17-04-2025 09:00", taskWork: "ABC Enterprise - Dealer Price", assigneeName: "Manish Aavanti", assignerName: "Manish Aavanti", createdDate: "07-04-2025 11:58", deadline: "12-04-2025 12:00", status: "Under Process" }
  ];

  // Approval Data
  const approvalData = [
    { tenderId: 25320, approvalFor: "Approval This Tender", approvalFrom: "Mitir Modi", inFlow: "Mitir Modi", requester: "Palak Shah", requestDate: "12-03-2025 11:37", actionDate: "13-03-2025 12:00", deadline: "13-03-2025 12:00", status: "Pending" },
    { tenderId: 195, approvalFor: "Tendors Bidding", approvalFrom: "Yogesh Gadhavi", inFlow: "Yogesh Gadhvi", requester: "Palak Shah", requestDate: "18-03-2025 10:25", actionDate: "19-03-2025 12:00", deadline: "19-03-2025 12:00", status: "Pending" }
  ];

  // User Management Data
  const userData = [
    { name: "Amit Mishra", loginUserId: "mamit9464@gmail.com", email: "mamit9464@gmail.com", contact: "9510943496", department: "Tender Department", designation: "Tender EA", roleName: "Tender Filing", createdDate: "08-04-2025", status: "Active" },
    { name: "Binal Vasanwala", loginUserId: "binal@tender247.com", email: "binal@tender247.com", contact: "9726804000", department: "Tender - Binal", designation: "Sales Manager", roleName: "Tender - Bidding", createdDate: "08-04-2025", status: "Active" },
    { name: "Tushar Sahayata", loginUserId: "tushar@tender247.com", email: "tushar@tender247.com", contact: "9510979431", department: "Finance - Tushar", designation: "Finance Manager", roleName: "Finance MF", createdDate: "35-03-2025", status: "Active" }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Sales Dashboard', icon: BarChart3 },
    { id: 'finance-dashboard', label: 'Finance Dashboard', icon: DollarSign },
    { id: 'tender-listing', label: 'Tender', icon: FileText },
    { id: 'tender-results', label: 'Tender Result', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'tender-task', label: 'Tender Task', icon: CheckCircle },
    { id: 'finance', label: 'Finance Management', icon: DollarSign },
    { id: 'mis', label: 'MIS', icon: BarChart3 },
    { id: 'documents', label: 'Document Management', icon: FileText },
    { id: 'tasks', label: 'Task', icon: CheckCircle },
    { id: 'approvals', label: 'Approval\'s', icon: CheckCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'oem', label: 'OEM Management', icon: Building },
    { id: 'utility', label: 'Utility', icon: Settings },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'ai-module', label: 'AI Assistant', icon: Star },
    { id: 'add-tender', label: 'Tender Add / Modify', icon: Plus }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Welcome</h1>
          <h2 className="text-xl">Palak Shah!</h2>
        </div>
        <div className="text-right">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-12 w-12 text-white/80" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Fresh Tender</p>
              <p className="text-3xl font-bold text-blue-600">{dashboardStats.freshTenders}</p>
            </div>
            <FileText className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Live Tender</p>
              <p className="text-3xl font-bold text-green-600">{dashboardStats.liveTenders}</p>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1 inline-block">New</span>
            </div>
            <Clock className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tender Result</p>
              <p className="text-3xl font-bold text-orange-600">{dashboardStats.tenderResults}</p>
            </div>
            <Award className="h-12 w-12 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Submitted Tender</p>
              <p className="text-3xl font-bold text-purple-600">{dashboardStats.submittedTenders}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">My Tender</p>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">New</span>
          </div>
          <p className="text-2xl font-bold">{dashboardStats.myTenders}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">In Process Tender</p>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">New</span>
          </div>
          <p className="text-2xl font-bold">{dashboardStats.inProcessTenders}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Assigned To Team</p>
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">New</span>
          </div>
          <p className="text-2xl font-bold">{dashboardStats.assignedToTeam}</p>
        </div>
      </div>

      {/* Calendar and Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">April 2025</h3>
            <div className="flex space-x-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="p-2 font-medium text-gray-500">{day}</div>
            ))}
            {Array.from({length: 30}, (_, i) => (
              <div key={i} className={`p-2 hover:bg-blue-50 cursor-pointer rounded ${i === 7 ? 'bg-blue-100 text-blue-700 font-bold' : i === 14 || i === 22 ? 'bg-green-100 text-green-700' : ''}`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-blue-600">Today's Activity</h3>
          <div className="space-y-4">
            {todayActivities.map((activity, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium">Tender Assigned to team</p>
                  <span className={`text-xs px-2 py-1 rounded ${activity.status === 'Completed' ? 'bg-green-100 text-green-800' : activity.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Tender ID: {activity.id}</p>
                <p className="text-xs text-gray-500">Assign To: {activity.assignee}</p>
                <p className="text-xs text-gray-500">Assign Date & Time: {activity.dueDate}</p>
                <p className="text-xs text-gray-500">Submission Date: {activity.submissionDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
        <div className="flex items-center mb-4">
          <Star className="h-6 w-6 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">AI Insights & Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-sm text-blue-600 mb-2">📊 Market Analysis</h4>
            <p className="text-xs text-gray-600">Construction tenders increased by 23% this month. Recommend focusing on infrastructure projects.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-sm text-green-600 mb-2">🎯 Win Probability</h4>
            <p className="text-xs text-gray-600">Tender #86964458 has 78% win probability based on your company profile and past performance.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-sm text-purple-600 mb-2">⚡ Auto Actions</h4>
            <p className="text-xs text-gray-600">AI auto-generated 3 responses today. 2 documents analyzed for eligibility criteria.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinanceDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Finance Dashboard</h2>
        <div className="text-right">
          <p className="text-sm text-gray-500">Palak Shah</p>
        </div>
      </div>

      {/* EMD & SD Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-2">EMD Payment & Refund Summary</h3>
          <p className="text-sm text-blue-600 mb-1">Paid EMD: ₹ {financeStats.emdPayment.paid.toLocaleString()}</p>
          <p className="text-sm text-blue-600">Refund EMD: ₹ {financeStats.emdPayment.refund.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-2">SD Payment & Refund Summary</h3>
          <p className="text-sm text-green-600 mb-1">Paid SD: ₹ {financeStats.sdPayment.paid}</p>
          <p className="text-sm text-green-600">Refund SD: ₹ {financeStats.sdPayment.refund}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-2">EMD Under Process</h3>
          <p className="text-lg font-bold text-orange-600">Under Process EMD: ₹ {financeStats.emdUnderProcess.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-2">EMD & SD Forfeited</h3>
          <p className="text-sm text-red-600 mb-1">Forfeited EMD: ₹ {financeStats.emdForfeited}</p>
          <p className="text-sm text-red-600">Refund SD: ₹ {financeStats.sdForfeited}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm text-gray-500 mb-2">Expired EMD & SD</h3>
          <p className="text-sm text-gray-600 mb-1">Expired EMD: ₹ {financeStats.expired.emd.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Expired SD: ₹ {financeStats.expired.sd}</p>
        </div>
      </div>

      {/* Finance Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Bank Guarantee</h3>
          <p className="text-sm text-gray-500 mb-1">New Request: {financeStats.newRequests.bankGuarantee}</p>
          <p className="text-sm text-gray-500">Used B.G: {financeStats.usedRequests.bankGuarantee}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Security Deposit</h3>
          <p className="text-sm text-gray-500 mb-1">New Request: {financeStats.newRequests.securityDeposit}</p>
          <p className="text-sm text-gray-500">Used S.D: {financeStats.usedRequests.securityDeposit}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Fees</h3>
          <p className="text-sm text-gray-500 mb-1">New Request: {financeStats.newRequests.fees.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Used Fees: {financeStats.usedRequests.fees}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="font-semibold mb-2">Others</h3>
          <p className="text-sm text-gray-500 mb-1">New Request: {financeStats.newRequests.others}</p>
          <p className="text-sm text-gray-500">Used Other: {financeStats.usedRequests.others}</p>
        </div>
      </div>

      {/* EMD Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-4 text-center">EMD</h3>
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">New Request: {financeStats.newRequests.emd}</p>
          <p className="text-sm text-gray-600">Used Emd: {financeStats.usedRequests.emd}</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">April 2025</h3>
          <div className="flex space-x-2">
            <button className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-2 font-medium text-gray-500">{day}</div>
          ))}
          {Array.from({length: 30}, (_, i) => (
            <div key={i} className={`p-2 hover:bg-blue-50 cursor-pointer rounded ${i === 8 ? 'bg-green-100 text-green-700' : i === 15 || i === 17 || i === 25 ? 'bg-orange-100 text-orange-700' : ''}`}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTenderListing = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tender</h2>
        <div className="text-right">
          <p className="text-sm text-gray-500">Palak Shah</p>
        </div>
      </div>

      {/* Comprehensive Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Tender Filter</h3>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showFilters ? '▲' : '▼'}
          </button>
        </div>
        
        {showFilters && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input 
                type="text" 
                placeholder="Search by Keywords" 
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <input 
                type="text" 
                placeholder="Reference Number" 
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <select className="border border-gray-300 rounded-lg px-3 py-2">
                <option>Select State</option>
                <option>West Bengal</option>
                <option>Bihar</option>
                <option>Uttar Pradesh</option>
                <option>All States</option>
              </select>
              <input 
                type="text" 
                placeholder="City" 
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input 
                type="text" 
                placeholder="Department Name" 
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <select className="border border-gray-300 rounded-lg px-3 py-2">
                <option>Tender Status</option>
                <option>Fresh</option>
                <option>Live</option>
                <option>Submitted</option>
                <option>In Process</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-3 py-2">
                <option>Assign By</option>
                <option>Palak Shah</option>
                <option>Admin</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-3 py-2">
                <option>Assign To</option>
                <option>Yogesh Gadhavi</option>
                <option>Vinisha Patel</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Search
              </button>
              <button className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export To Excel
        </button>
      </div>

      {/* Tender Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'fresh', label: 'Fresh', count: null },
              { id: 'live', label: 'Live', count: 55 },
              { id: 'archive', label: 'Archive', count: null },
              { id: 'interested', label: 'Interested', count: null }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} {tab.count && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Sort Options */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">Showing results</span>
          <select className="border border-gray-300 rounded px-3 py-1 text-sm">
            <option>Value ↓</option>
            <option>Date ↓</option>
            <option>Deadline ↓</option>
          </select>
        </div>

        {/* Tender List */}
        <div className="p-6">
          <div className="space-y-4">
            {sampleTenders.map((tender) => (
              <div key={tender.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <input type="checkbox" className="rounded" />
                      <span className="text-lg font-bold text-blue-600">#{tender.id}</span>
                      <span className="text-sm text-gray-500">|</span>
                      <span className="text-sm text-gray-500">{tender.dueDate}</span>
                      <span className="text-sm text-red-500 font-medium">5 Days Left</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                        EMD: ₹ {tender.value.toLocaleString()}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                        {tender.status}
                      </span>
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {tender.type}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-3 text-base leading-relaxed">
                      {tender.title}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{tender.organization}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3 ml-6">
                    <span className="text-lg font-bold text-gray-900">
                      Tender Id - {tender.tenderId || tender.id}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Documents"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="AI Analysis"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTenderResults = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tender Result Listing</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Filter By</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input type="text" placeholder="Word Search / Result Id" className="border border-gray-300 rounded-lg px-3 py-2" />
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option>State</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option>Tendering Ownership</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option>Department</option>
          </select>
        </div>
        <div className="flex space-x-4 mt-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Search</button>
          <button className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">Clear</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Geeken Seating Collection Private Limited</h3>
          <div className="flex space-x-6 mt-4">
            {['Participated Tenders (307)', 'Awarded Tenders', 'Lost Tenders', 'L1 Bids', 'Financial Bids', 'Technical Bids'].map((tab, index) => (
              <button key={tab} className={`text-sm font-medium ${index === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'} pb-2`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {[
              { id: 10857438, title: "Purchase Rate Contract For Customised Modular And Standard Furniture And Partitions", stage: "Financial", date: "19-02-2024", location: "Jabalpur, Madhya Pradesh", department: "High Court Of Madhya Pradesh", ownership: "Central Government" },
              { id: 13081614, title: "Selection Of Bidder For Supply Of Lab Stool And Bottle Rack In Select C.M. Rise Schools In M.P.", stage: "Technical", date: "25-03-2025", location: "Bhopal, Madhya Pradesh", department: "Department Of Public Instruction", ownership: "Central Government" },
              { id: 12337445, title: "Spot Of Sanitary Furniture", stage: "AOC", date: "27-12-2024", location: "Bhopal, Madhya Pradesh", department: "Department Of Higher Education", ownership: "State Government" }
            ].map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-blue-600">Result ID: {result.id}</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Stage: {result.stage}</span>
                      <span className="text-sm text-gray-500">{result.date}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{result.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>📍 {result.location}</span>
                      <span>🏢 {result.department}</span>
                      <span>🏛️ {result.ownership}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-green-600 hover:bg-green-50 p-2 rounded">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAIModule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <Star className="h-8 w-8 text-yellow-500 mr-3" />
          AI Assistant Module
        </h2>
        <div className="text-right">
          <p className="text-sm text-gray-500">Palak Shah</p>
        </div>
      </div>

      {/* AI Use Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Document Analysis & Summarization */}
        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Document Analysis</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Automatically analyze tender documents, extract key information, and generate comprehensive summaries.
          </p>
          <div className="space-y-2">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm">
              Analyze Tender Document
            </button>
            <button className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded hover:bg-blue-200 text-sm">
              Generate Summary
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <strong>Use Case:</strong> Extract EMD amounts, submission dates, eligibility criteria from PDFs
          </div>
        </div>

        {/* 2. AI Generated Eligibility Criteria */}
        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Eligibility Checker</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            AI-powered eligibility assessment based on company profile and tender requirements.
          </p>
          <div className="space-y-2">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-sm">
              Check Eligibility
            </button>
            <button className="w-full bg-green-100 text-green-700 py-2 px-4 rounded hover:bg-green-200 text-sm">
              Generate Criteria
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <strong>Use Case:</strong> Match company credentials with tender requirements automatically
          </div>
        </div>

        {/* 3. Auto Response Preparation */}
        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <Edit className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Response Generator</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Automatically generate tender responses, annexures, and technical specifications.
          </p>
          <div className="space-y-2">
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 text-sm">
              Generate Response
            </button>
            <button className="w-full bg-purple-100 text-purple-700 py-2 px-4 rounded hover:bg-purple-200 text-sm">
              Create Annexures
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <strong>Use Case:</strong> Auto-fill tender forms with company data and compliance documents
          </div>
        </div>

        {/* 4. Competitive Intelligence */}
        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold">Market Intelligence</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Analyze competitor strategies, pricing patterns, and market trends using AI.
          </p>
          <div className="space-y-2">
            <button className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 text-sm">
              Analyze Competitors
            </button>
            <button className="w-full bg-orange-100 text-orange-700 py-2 px-4 rounded hover:bg-orange-200 text-sm">
              Price Optimization
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <strong>Use Case:</strong> Predict winning bid amounts based on historical data
          </div>
        </div>

        {/* 5. Risk Assessment */}
        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold">Risk Analyzer</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            AI-powered risk assessment for tender participation and contract terms.
          </p>
          <div className="space-y-2">
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-sm">
              Assess Risk
            </button>
            <button className="w-full bg-red-100 text-red-700 py-2 px-4 rounded hover:bg-red-200 text-sm">
              Risk Report
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <strong>Use Case:</strong> Identify potential legal, financial, and operational risks
          </div>
        </div>

        {/* 6. Smart Search & Recommendations */}
        <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
              <Search className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold">Smart Discovery</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Intelligent tender discovery based on company capabilities and preferences.
          </p>
          <div className="space-y-2">
            <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 text-sm">
              Find Relevant Tenders
            </button>
            <button className="w-full bg-indigo-100 text-indigo-700 py-2 px-4 rounded hover:bg-indigo-200 text-sm">
              Get Recommendations
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <strong>Use Case:</strong> AI matches tenders to company expertise and past wins
          </div>
        </div>
      </div>

      {/* AI Chat Interface */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            AI Tender Assistant Chat
          </h3>
        </div>
        <div className="p-4">
          <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                  <p className="text-sm">Hello! I'm your AI Tender Assistant. I can help you with:</p>
                  <ul className="text-xs mt-2 space-y-1 text-gray-600">
                    <li>• Analyzing tender documents</li>
                    <li>• Checking eligibility criteria</li>
                    <li>• Generating responses</li>
                    <li>• Risk assessment</li>
                    <li>• Market intelligence</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 justify-end">
                <div className="bg-blue-600 text-white p-3 rounded-lg shadow-sm max-w-md">
                  <p className="text-sm">Can you analyze the tender document for ID 86964458?</p>
                </div>
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                  <p className="text-sm">Analyzing tender #86964458... </p>
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <strong>Summary:</strong><br/>
                    • EMD Required: ₹2.68 Lakh<br/>
                    • Estimated Value: ₹98.42 Lakh<br/>
                    • Submission Deadline: 16-04-2025<br/>
                    • Eligibility: Construction experience required<br/>
                    • Risk Level: Medium
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Ask AI about tenders, eligibility, risks, or get recommendations..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* AI Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">AI Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Documents Analyzed</span>
              <span className="font-bold text-blue-600">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Auto-Generated Responses</span>
              <span className="font-bold text-green-600">356</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Risk Assessments</span>
              <span className="font-bold text-orange-600">892</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="font-bold text-purple-600">87.3%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent AI Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
              <FileText className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Document analyzed for Tender #86964458</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Eligibility check completed for 5 tenders</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Market analysis updated</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Configuration Panel */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold">AI Configuration & Settings</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Sensitivity
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>High (Detailed)</option>
                <option>Medium (Balanced)</option>
                <option>Low (Quick)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Response Mode
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Manual Review</option>
                <option>Semi-Automatic</option>
                <option>Fully Automatic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Threshold
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Conservative</option>
                <option>Moderate</option>
                <option>Aggressive</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Save Configuration
            </button>
            <button className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeModule) {
      case 'dashboard': return renderDashboard();
      case 'finance-dashboard': return renderFinanceDashboard();
      case 'tender-listing': return renderTenderListing();
      case 'tender-results': return renderTenderResults();
      case 'ai-module': return renderAIModule();
      default: 
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{menuItems.find(item => item.id === activeModule)?.label}</h3>
              <p className="text-gray-500">This module is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">T247</span>
            </div>
            {sidebarOpen && <h1 className="text-xl font-bold text-gray-800">TENDER247</h1>}
          </div>
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                  activeModule === item.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">PS</span>
                </div>
                <span className="text-sm font-medium">Palak Shah</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default TenderManagementApp;