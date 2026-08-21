import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Box,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Users,
  Mail,
  Newspaper,
  Building2,
  ShieldCheck,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  TrendingUp,
  UserCheck,
  FileText,
  X,
  Layers,
  DollarSign,
  Briefcase,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Filter,
  MessageCircle,
  Download,
  UserPlus,
  Activity,
  Briefcase as BriefcaseIcon,
  User,
  MapPin,
  Calendar,
  Award,
  Circle,
  PieChart,
  Inbox,
  Send,
  Star,
  Trash as TrashIcon,
  Tag,
  Star as StarIcon,
  AlertCircle,
  Paperclip,
  Reply,
  Forward,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Users as UsersIcon,
  FileText as FileTextIcon,
  FileCheck,
  Globe,
  Phone,
  Mail as MailIcon,
  UserCheck as UserCheckIcon,
  Award as AwardIcon,
  Target,
  Shield,
  BookOpen,
  FileSignature,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';

const API_URL = 'http://localhost:3001/api';

export default function SatesoftApp() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [animateCharts, setAnimateCharts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveImageUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^file:\/\//i.test(trimmed)) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('/')) return trimmed;
    if (trimmed.startsWith('data:')) return trimmed;
    return '/' + trimmed;
  };

  const apiFetch = async (endpoint, options = {}) => {
    try {
      const response = await axios({
        url: API_URL + endpoint,
        ...options,
        headers: {
          ...options.headers,
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
      });
      if (response.status < 200 || response.status >= 300) {
        throw new Error('HTTP ' + response.status + ' for ' + endpoint);
      }
      return response.data;
    } catch (err) {
      console.error('API error [' + (options.method || 'GET') + ' ' + endpoint + ']:', err);
      throw err;
    }
  };

  const handleClearArticleComments = async (article) => {
    const articleTitle = (newsPosts || []).find((n) => n.id === article.articleId)?.title || 'this article';
    if (!window.confirm(`Clear all comments for "${articleTitle}"? This cannot be undone.`)) return;
    
    console.log('Clearing comments for article:', article.articleId);
    
    try {
      const deleteResult = await apiFetch(`/comments/article/${article.articleId}`, { method: 'DELETE' });
      console.log('Delete result:', deleteResult);
      
      const updatedData = await apiFetch('/comments/by-article');
      console.log('Updated comments data:', updatedData);
      setViewStatsDetail((prev) => ({
        ...prev,
        data: updatedData,
      }));
      
      try {
        localStorage.setItem('satesoft_comments_cleared', JSON.stringify({ articleId: article.articleId, timestamp: Date.now() }));
      } catch {}

      await fetchDashboardData();
      console.log('Dashboard data refreshed');
    } catch (err) {
      console.error('Failed to clear comments:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to clear comments. Please try again.';
      alert(errorMessage);
    }
  };

  const fetchDashboardData = async () => {
    console.log('fetchDashboardData started');
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching API data...');
      const [statsData, emails, applicantsData, productsData, partnersData, advisorsData, jobsData, newsData, serviceAgreementsData, jurisdictionsData, contactsData, pricingData, privacyPoliciesData, servicesData, subscribersCount, milestonesData] = await Promise.all([
        apiFetch('/stats').catch((err) => { console.error('stats error', err); return []; }),
        apiFetch('/messages').catch((err) => { console.error('messages error', err); return []; }),
        apiFetch('/applicants').catch((err) => { console.error('applicants error', err); return []; }),
        apiFetch('/products').catch((err) => { console.error('products error', err); return []; }),
        apiFetch('/partners').catch((err) => { console.error('partners error', err); return []; }),
        apiFetch('/advisors').catch((err) => { console.error('advisors error', err); return []; }),
        apiFetch('/jobs').catch((err) => { console.error('jobs error', err); return []; }),
        apiFetch('/news').catch((err) => { console.error('news error', err); return []; }),
        apiFetch('/service-agreements').catch((err) => { console.error('service-agreements error', err); return []; }),
        apiFetch('/jurisdictions').catch((err) => { console.error('jurisdictions error', err); return []; }),
        apiFetch('/contacts').catch((err) => { console.error('contacts error', err); return []; }),
        apiFetch('/pricing').catch((err) => { console.error('pricing error', err); return []; }),
        apiFetch('/privacy-policies').catch((err) => { console.error('privacy-policies error', err); return []; }),
        apiFetch('/services').catch((err) => { console.error('services error', err); return []; }),
        apiFetch('/subscribers/count').catch((err) => { console.error('subscribers count error', err); return { count: 0 }; }),
        apiFetch('/milestones').catch((err) => { console.error('milestones error', err); return []; }),
      ]);
      console.log('API data fetched:', { statsData, newsData, subscribersCount });

      let commentsByArticleData = [];
      try {
        commentsByArticleData = await apiFetch('/comments/by-article');
        console.log('comments/by-article raw:', commentsByArticleData);
      } catch (err) {
        console.error('comments/by-article fetch error:', err);
      }

      const statsMap = {
        'Comments': 'comments',
        'Views': 'views',
      };
      const mappedStats = { comments: 0, views: 0, subscribers: subscribersCount.count || 0 };
      let statsMatched = false;
      statsData.forEach((item) => {
        const key = statsMap[item.title];
        if (key) {
          mappedStats[key] = Number(item.value) || 0;
          statsMatched = true;
        }
      });
      if (!statsMatched && statsData.length > 0) {
        const fallbackKeys = ['comments', 'views'];
        statsData.slice(0, 2).forEach((item, idx) => {
          if (fallbackKeys[idx]) {
            mappedStats[fallbackKeys[idx]] = Number(item.value) || 0;
          }
        });
      }
      
      const totalComments = (commentsByArticleData || []).reduce((sum, article) => sum + (article.totalComments || 0), 0);
      mappedStats.comments = totalComments;
      
      const totalViews = (newsData || []).reduce((sum, article) => sum + (article.views || 0), 0);
      mappedStats.views = totalViews;
      
      console.log('Dashboard data:', { commentsByArticleData, totalComments, totalViews, newsData, subscribersCount });
      
      setStats(mappedStats);
      setEmails(emails);
      console.log('setStats called with:', mappedStats);

      const oppCounts = {};
      applicantsData.forEach((a) => {
        const opp = a.opportunity || 'Unknown';
        oppCounts[opp] = (oppCounts[opp] || 0) + 1;
      });
      setApplicantsPerOpportunity(
        Object.keys(oppCounts).map((opp) => ({
          opportunity: opp,
          applicants: oppCounts[opp],
        }))
      );

      const mappedProducts = productsData.map((p) => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        category: p.category || 'General',
        iconType: p.iconType || 'trending',
        status: 'Active',
        version: '1.0.0',
        lastUpdated: p.lastUpdated || new Date().toISOString().split('T')[0],
        logoUrl: p.logoUrl || '',
        description: p.description || '',
        keyFeatures: Array.isArray(p.keyFeatures) ? p.keyFeatures : [],
      }));
      setProducts(mappedProducts);
      setPartners(partnersData);

      const mappedAdvisors = advisorsData.map((a) => ({
        id: a.id,
        name: (a.firstName || '') + ' ' + (a.lastName || ''),
        role: a.roleName || 'Advisor',
        status: a.isActive ? 'Active' : 'Inactive',
        order: a.order || 0,
        email: a.email || '',
        contact: a.contact || '',
        linkedIn: a.profileLink || '',
        message: a.message || '',
        imageUrl: a.imageUrl,
        profileLink: a.profileLink,
      }));
      setAdvisors(mappedAdvisors);
      setJobOpportunities(jobsData);
      setNewsPosts(newsData);
      setServiceAgreements(serviceAgreementsData || []);
      setJurisdictions(jurisdictionsData || []);
      setContacts(contactsData || []);
      setPricing(pricingData || []);
      setPrivacyPolicies(privacyPoliciesData || []);

      const mappedServices = servicesData.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle || '',
        description: s.description || '',
        summary: s.summary || '',
        features: Array.isArray(s.features) ? s.features : [],
        imageUrl: s.imageUrl || '',
        displayOrder: s.displayOrder || 0,
      }));
      setServices(mappedServices);
      setMilestones(milestonesData || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    const handleRefresh = () => {
      console.log('dashboard-refresh event received, activeTab:', activeTab);
      if (activeTab === 'dashboard') {
        console.log('Refreshing dashboard data...');
        fetchDashboardData();
      }
    };
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, [activeTab]);

  useEffect(() => {
    const handleStorageRefresh = (e) => {
      if (e.key === 'satesoft_dashboard_refresh' && activeTab === 'dashboard') {
        console.log('Storage refresh detected, refreshing dashboard...');
        fetchDashboardData();
      }
    };
    window.addEventListener('storage', handleStorageRefresh);
    return () => window.removeEventListener('storage', handleStorageRefresh);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      setAnimateCharts(false);
      const timer = setTimeout(() => setAnimateCharts(true), 150);
      return () => clearTimeout(timer);
    } else {
      setAnimateCharts(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchJobOpportunities();
      fetchEmails();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'pricing') fetchPricing();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'services') fetchServices();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'partner-list') fetchPartners();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'opportunities') {
      fetchOpportunities();
      fetchJobOpportunities();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'applicants') {
      fetchApplicants();
      const interval = setInterval(() => fetchApplicants(), 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'mailbox') fetchEmails();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'news') fetchNewsPosts();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'journey') fetchMilestones();
  }, [activeTab]);

  const [openAccordions, setOpenAccordions] = useState({
    products: false,
    services: false,
    opportunity: false,
    partner: true,
    corporate: false,
    legal: false,
    opportunityMgt: false,
    corporateMgt: false,
    legalMgt: false,
    settings: false,
    journey: false
  });

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // --- STATE DECLARATIONS ---
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceModalMode, setServiceModalMode] = useState('add');
  const [selectedService, setSelectedService] = useState(null);
  const [viewService, setViewService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    summary: '',
    features: '',
    imageUrl: '',
    displayOrder: 0
  });
  const [partners, setPartners] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [jobOpportunities, setJobOpportunities] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [emails, setEmails] = useState([]);
  const [newsPosts, setNewsPosts] = useState([]);
  const [serviceAgreements, setServiceAgreements] = useState([]);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [agreementModalMode, setAgreementModalMode] = useState('add');
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [agreementFormData, setAgreementFormData] = useState({ title: '', content: '' });
  const [collapsedSections, setCollapsedSections] = useState({});
  const [grammarResult, setGrammarResult] = useState('');
  const [grammarChecking, setGrammarChecking] = useState(false);
  const [viewAgreement, setViewAgreement] = useState(null);
  const [privacyPolicies, setPrivacyPolicies] = useState([]);
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);
  const [privacyPolicyModalMode, setPrivacyPolicyModalMode] = useState('add');
  const [selectedPrivacyPolicy, setSelectedPrivacyPolicy] = useState(null);
  const [viewPrivacyPolicy, setViewPrivacyPolicy] = useState(null);
  const [privacyPolicyFormData, setPrivacyPolicyFormData] = useState({ title: '', content: '' });
  const [jurisdictions, setJurisdictions] = useState([]);
  const [isJurisdictionModalOpen, setIsJurisdictionModalOpen] = useState(false);
  const [jurisdictionModalMode, setJurisdictionModalMode] = useState('add');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(null);
  const [viewJurisdiction, setViewJurisdiction] = useState(null);
  const [jurisdictionFormData, setJurisdictionFormData] = useState({
    country: '',
    entity_type: '',
    lead_entity: '',
    primary_law: '',
    additional_laws: ''
  });
  const [contacts, setContacts] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalMode, setContactModalMode] = useState('add');
  const [selectedContact, setSelectedContact] = useState(null);
  const [viewContact, setViewContact] = useState(null);
  const [contactFormData, setContactFormData] = useState({
    placeholder_id: '',
    contact_point: '',
    purpose_context: '',
    section: '',
    category: 'general'
  });
  const [pricing, setPricing] = useState([]);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingModalMode, setPricingModalMode] = useState('add');
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [viewPricing, setViewPricing] = useState(null);
  const [pricingFormData, setPricingFormData] = useState({
    plan: '',
    price: '',
    features: '',
    popular: false,
    display_order: 0
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [accountFormData, setAccountFormData] = useState({ username: '', currentPassword: '', newPassword: '' });
  const [accountMessage, setAccountMessage] = useState('');
  const [accountError, setAccountError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [legalData, setLegalData] = useState({});
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState('add');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({ name: '', tagline: '', category: 'Software Solution', logoUrl: '', description: '', keyFeatures: '' });
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerModalMode, setPartnerModalMode] = useState('add');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [viewPartner, setViewPartner] = useState(null);
  const [partnerFormData, setPartnerFormData] = useState({
    name: '',
    joined: new Date().toISOString().split('T')[0],
    industry: '',
    location: '',
    contactName: '',
    contactEmail: '',
    status: 'ACTIVE'
  });
  const [milestones, setMilestones] = useState([]);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneModalMode, setMilestoneModalMode] = useState('add');
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [viewMilestone, setViewMilestone] = useState(null);
  const [viewActivity, setViewActivity] = useState(null);
  const [milestoneFormData, setMilestoneFormData] = useState({
    year: '',
    title: '',
    description: '',
    color: '#72bf24',
    displayOrder: 0,
    icon: ''
  });
  const [milestoneActivities, setMilestoneActivities] = useState([]);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityModalMode, setActivityModalMode] = useState('add');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityFormData, setActivityFormData] = useState({
    month: '',
    title: '',
    description: '',
    displayOrder: 0
  });

  // --- PRODUCT HANDLERS ---
  const handleOpenAddProduct = () => {
    setProductModalMode('add');
    setSelectedProduct(null);
    setProductFormData({ name: '', tagline: '', category: 'Software Solution', logoUrl: '', description: '', keyFeatures: '' });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setProductModalMode('edit');
    setSelectedProduct(product);
    setProductFormData({
      name: product.name,
      tagline: product.tagline,
      category: product.category || 'Software Solution',
      logoUrl: product.logoUrl || '',
      description: product.description || '',
      keyFeatures: Array.isArray(product.keyFeatures) ? product.keyFeatures.join(', ') : (product.keyFeatures || ''),
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const keyFeaturesArray = productFormData.keyFeatures
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      if (productModalMode === 'add') {
        const data = await apiFetch('/products', {
          method: 'POST',
          data: {
            name: productFormData.name,
            tagline: productFormData.tagline,
            category: productFormData.category,
            iconType: 'layers',
            logoUrl: productFormData.logoUrl || null,
            description: productFormData.description || null,
            keyFeatures: keyFeaturesArray,
          },
        });
        await fetchProducts();
        setIsProductModalOpen(false);
      } else {
        const data = await apiFetch('/products/' + selectedProduct.id, {
          method: 'PUT',
          data: {
            name: productFormData.name,
            tagline: productFormData.tagline,
            category: productFormData.category,
            iconType: selectedProduct.iconType || 'layers',
            logoUrl: productFormData.logoUrl || null,
            description: productFormData.description || null,
            keyFeatures: keyFeaturesArray,
          },
        });
        setProducts(products.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
        setIsProductModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      alert(err.response?.data?.error || 'Failed to save product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiFetch('/products/' + id, { method: 'DELETE' });
        await fetchProducts();
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert(err.response?.data?.error || 'Failed to delete product. Please try again.');
      }
    }
  };

  const handleViewProduct = (product) => {
    setViewProduct(product);
  };

  // --- SERVICE HANDLERS ---
  const handleOpenAddService = () => {
    setServiceModalMode('add');
    setSelectedService(null);
    setServiceFormData({ title: '', subtitle: '', description: '', summary: '', features: '', imageUrl: '', displayOrder: 0 });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service) => {
    setServiceModalMode('edit');
    setSelectedService(service);
    setServiceFormData({
      title: service.title,
      subtitle: service.subtitle || '',
      description: service.description || '',
      summary: service.summary || '',
      features: Array.isArray(service.features) ? service.features.join(', ') : (service.features || ''),
      imageUrl: service.imageUrl || '',
      displayOrder: service.displayOrder || 0,
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const featuresArray = serviceFormData.features
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      if (serviceModalMode === 'add') {
        const data = await apiFetch('/services', {
          method: 'POST',
          data: {
            title: serviceFormData.title,
            subtitle: serviceFormData.subtitle || null,
            description: serviceFormData.description || null,
            summary: serviceFormData.summary || null,
            features: featuresArray,
            imageUrl: serviceFormData.imageUrl || null,
            displayOrder: serviceFormData.displayOrder,
          },
        });
        await fetchServices();
        setIsServiceModalOpen(false);
      } else {
        const data = await apiFetch('/services/' + selectedService.id, {
          method: 'PUT',
          data: {
            title: serviceFormData.title,
            subtitle: serviceFormData.subtitle || null,
            description: serviceFormData.description || null,
            summary: serviceFormData.summary || null,
            features: featuresArray,
            imageUrl: serviceFormData.imageUrl || null,
            displayOrder: serviceFormData.displayOrder,
          },
        });
        setServices(services.map((s) => (s.id === data.id ? { ...s, ...data } : s)));
        setIsServiceModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save service:', err);
      alert(err.response?.data?.error || 'Failed to save service. Please try again.');
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await apiFetch('/services/' + id, { method: 'DELETE' });
        await fetchServices();
      } catch (err) {
        console.error('Failed to delete service:', err);
        alert(err.response?.data?.error || 'Failed to delete service. Please try again.');
      }
    }
  };

  const handleViewService = (service) => {
    setViewService(service);
  };

  const fetchServices = async () => {
    try {
      const data = await apiFetch('/services');
      const mapped = data.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle || '',
        description: s.description || '',
        summary: s.summary || '',
        features: Array.isArray(s.features) ? s.features : [],
        imageUrl: s.imageUrl || '',
        displayOrder: s.displayOrder || 0,
      }));
      setServices(mapped);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  // --- OPPORTUNITY HANDLERS ---
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [opportunityModalMode, setOpportunityModalMode] = useState('add');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [viewOpportunity, setViewOpportunity] = useState(null);
  const [opportunityFormData, setOpportunityFormData] = useState({
    title: '',
    location: '',
    type: 'Full-time',
    keyRequirements: '',
    description: '',
    applications: 0,
    status: 'Active'
  });
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleOpenAddOpportunity = () => {
    setOpportunityModalMode('add');
    setSelectedOpportunity(null);
    setOpportunityFormData({
      title: '',
      location: '',
      type: 'Full-time',
      keyRequirements: '',
      description: '',
      applications: 0,
      status: 'Active'
    });
    setIsOpportunityModalOpen(true);
  };

  const handleOpenEditOpportunity = (opportunity) => {
    setOpportunityModalMode('edit');
    setSelectedOpportunity(opportunity);
    setOpportunityFormData({
      title: opportunity.title,
      location: opportunity.location,
      type: opportunity.type,
      keyRequirements: opportunity.keyRequirements || '',
      description: opportunity.description || '',
      applications: opportunity.applications || 0,
      status: opportunity.status || 'Active'
    });
    setIsOpportunityModalOpen(true);
  };

  const handleSaveOpportunity = async (e) => {
    e.preventDefault();
    try {
      if (opportunityModalMode === 'add') {
        const data = await apiFetch('/jobs', {
          method: 'POST',
          data: {
            title: opportunityFormData.title,
            location: opportunityFormData.location,
            type: opportunityFormData.type,
            applications: opportunityFormData.applications,
            status: opportunityFormData.status,
          },
        });
        setJobOpportunities([...jobOpportunities, data]);
      } else {
        const data = await apiFetch('/jobs/' + selectedOpportunity.id, {
          method: 'PUT',
          data: {
            title: opportunityFormData.title,
            location: opportunityFormData.location,
            type: opportunityFormData.type,
            applications: opportunityFormData.applications,
            status: opportunityFormData.status,
          },
        });
        setJobOpportunities(jobOpportunities.map((j) => (j.id === data.id ? data : j)));
      }
      setIsOpportunityModalOpen(false);
    } catch (err) {
      console.error('Failed to save opportunity:', err);
    }
  };

  const handleDeleteOpportunity = async (id) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await apiFetch('/jobs/' + id, { method: 'DELETE' });
        setJobOpportunities(jobOpportunities.filter((j) => j.id !== id));
      } catch (err) {
        console.error('Failed to delete opportunity:', err);
      }
    }
  };

  const handleViewOpportunity = (opportunity) => {
    setViewOpportunity(opportunity);
  };

  const handleGenerateDescription = async () => {
    setIsGeneratingDescription(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const jobType = opportunityFormData.type.toLowerCase();
      let generatedDescription = '';
      
      if (jobType.includes('developer') || jobType.includes('engineer')) {
        generatedDescription = 'We are seeking a talented ' + opportunityFormData.title + ' to join our dynamic team. The ideal candidate will have strong technical skills, a passion for innovation, and the ability to work collaboratively in a fast-paced environment. You will be responsible for designing, developing, and maintaining high-quality software solutions that drive business value.';
      } else if (jobType.includes('designer') || jobType.includes('ux')) {
        generatedDescription = 'We are looking for a creative ' + opportunityFormData.title + ' who is passionate about creating exceptional user experiences. The ideal candidate will have a strong eye for design, excellent communication skills, and the ability to translate complex requirements into intuitive and beautiful interfaces.';
      } else if (jobType.includes('manager') || jobType.includes('product')) {
        generatedDescription = 'We are seeking an experienced ' + opportunityFormData.title + ' to lead and inspire our team. The ideal candidate will have proven leadership experience, strategic thinking abilities, and a track record of delivering successful projects. You will be responsible for managing cross-functional teams, driving product vision, and ensuring timely delivery of high-quality outcomes.';
      } else if (jobType.includes('devops') || jobType.includes('operations')) {
        generatedDescription = 'We are looking for a skilled ' + opportunityFormData.title + ' to build and maintain our infrastructure. The ideal candidate will have strong experience with cloud platforms, CI/CD pipelines, and infrastructure as code. You will play a critical role in ensuring system reliability, scalability, and security.';
      } else {
        generatedDescription = 'We are seeking a dedicated ' + opportunityFormData.title + ' to contribute to our growing team. The ideal candidate will have relevant experience, strong problem-solving skills, and a commitment to excellence. You will work closely with team members to achieve organizational goals and drive continuous improvement.';
      }
      
      setOpportunityFormData({ ...opportunityFormData, description: generatedDescription });
    } catch (err) {
      console.error('Failed to generate description:', err);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleApplicationsChange = (id, delta) => {
    setJobOpportunities(jobOpportunities.map((j) => {
      if (j.id === id) {
        const newCount = Math.max(0, (j.applications || 0) + delta);
        return { ...j, applications: newCount };
      }
      return j;
    }));
  };

  // --- PARTNER HANDLERS ---
  const handleOpenAddPartner = () => {
    setPartnerModalMode('add');
    setSelectedPartner(null);
    setPartnerFormData({ name: '', joined: new Date().toISOString().split('T')[0], industry: '', location: '', contactName: '', contactEmail: '', status: 'ACTIVE' });
    setIsPartnerModalOpen(true);
  };

  const handleOpenEditPartner = (partner) => {
    setPartnerModalMode('edit');
    setSelectedPartner(partner);
    setPartnerFormData({
      name: partner.name,
      joined: partner.joined || new Date().toISOString().split('T')[0],
      industry: partner.industry,
      location: partner.location,
      contactName: partner.contactName || '',
      contactEmail: partner.contactEmail || '',
      status: partner.status || 'ACTIVE'
    });
    setIsPartnerModalOpen(true);
  };

  const handleSavePartner = async (e) => {
    e.preventDefault();
    try {
      if (partnerModalMode === 'add') {
        const data = await apiFetch('/partners', {
          method: 'POST',
          data: partnerFormData,
        });
        setPartners([...partners, data]);
      } else {
        const data = await apiFetch('/partners/' + selectedPartner.id, {
          method: 'PUT',
          data: partnerFormData,
        });
        setPartners(partners.map((p) => (p.id === data.id ? data : p)));
      }
      setIsPartnerModalOpen(false);
    } catch (err) {
      console.error('Failed to save partner:', err);
    }
  };

  const handleViewPartner = (partner) => {
    setViewPartner(partner);
  };

  const handleDeletePartner = async (id) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        await apiFetch('/partners/' + id, { method: 'DELETE' });
        setPartners(partners.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Failed to delete partner:', err);
      }
    }
  };

  const handleTerminatePartner = async (id) => {
    try {
      const data = await apiFetch('/partners/' + id + '/terminate', { method: 'PUT' });
      setPartners(partners.map((p) => (p.id === data.id ? data : p)));
    } catch (err) {
      console.error('Failed to terminate/reactivate partner:', err);
    }
  };

  // --- MILESTONE HANDLERS ---
  const handleOpenAddMilestone = () => {
    setMilestoneModalMode('add');
    setSelectedMilestone(null);
    setMilestoneFormData({ year: '', title: '', description: '', color: '#72bf24', displayOrder: 0, icon: '' });
    setIsMilestoneModalOpen(true);
  };

  const handleOpenEditMilestone = (milestone) => {
    setMilestoneModalMode('edit');
    setSelectedMilestone(milestone);
    setMilestoneFormData({
      year: milestone.year,
      title: milestone.title,
      description: milestone.description || '',
      color: milestone.color || '#72bf24',
      displayOrder: milestone.displayOrder || 0,
      icon: milestone.icon || '',
    });
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = async (e) => {
    e.preventDefault();
    try {
      if (milestoneModalMode === 'add') {
        await apiFetch('/milestones', {
          method: 'POST',
          data: milestoneFormData,
        });
      } else {
        await apiFetch('/milestones/' + selectedMilestone.id, {
          method: 'PUT',
          data: milestoneFormData,
        });
      }
      setIsMilestoneModalOpen(false);
      fetchMilestones();
    } catch (err) {
      console.error('Failed to save milestone:', err);
      const message = err?.response?.data?.error || err?.message || 'Failed to save milestone. Please try again.';
      alert(message);
    }
  };

  const handleDeleteMilestone = async (id) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        await apiFetch('/milestones/' + id, { method: 'DELETE' });
        fetchMilestones();
      } catch (err) {
        console.error('Failed to delete milestone:', err);
        const message = err?.response?.data?.error || err?.message || 'Failed to delete milestone. Please try again.';
        alert(message);
      }
    }
  };

  const handleViewMilestone = async (milestone) => {
    try {
      const data = await apiFetch('/milestones/' + milestone.id);
      setViewMilestone(data);
      const activities = await apiFetch('/milestones/' + milestone.id + '/activities');
      setMilestoneActivities(activities || []);
    } catch (err) {
      console.error('Failed to fetch milestone details:', err);
      const message = err?.response?.data?.error || err?.message || 'Failed to load milestone details.';
      alert(message);
    }
  };

  const handleViewActivity = (activity) => {
    setViewActivity(activity);
  };

  const fetchMilestones = async () => {
    try {
      const data = await apiFetch('/milestones');
      setMilestones(data || []);
    } catch (err) {
      console.error('Failed to fetch milestones:', err);
    }
  };

  // --- MILESTONE ACTIVITY HANDLERS ---
  const handleOpenAddActivity = () => {
    setActivityModalMode('add');
    setSelectedActivity(null);
    setActivityFormData({ month: '', title: '', description: '', displayOrder: 0 });
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivity = (activity) => {
    setActivityModalMode('edit');
    setSelectedActivity(activity);
    setActivityFormData({
      month: activity.month,
      title: activity.title,
      description: activity.description || '',
      displayOrder: activity.displayOrder || 0,
    });
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    try {
      if (!viewMilestone) return;
      if (activityModalMode === 'add') {
        const data = await apiFetch('/milestones/' + viewMilestone.id + '/activities', {
          method: 'POST',
          data: activityFormData,
        });
        setMilestoneActivities((prev) => [...prev, data]);
        setIsActivityModalOpen(false);
      } else {
        const data = await apiFetch('/milestone-activities/' + selectedActivity.id, {
          method: 'PUT',
          data: activityFormData,
        });
        setMilestoneActivities((prev) => prev.map((a) => (a.id === data.id ? { ...a, ...data } : a)));
        setIsActivityModalOpen(false);
      }
      handleViewMilestone(viewMilestone);
    } catch (err) {
      console.error('Failed to save activity:', err);
      const message = err?.response?.data?.error || err?.message || 'Failed to save activity. Please try again.';
      alert(message);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await apiFetch('/milestone-activities/' + id, { method: 'DELETE' });
        setMilestoneActivities((prev) => prev.filter((a) => a.id !== id));
        if (viewMilestone) {
          handleViewMilestone(viewMilestone);
        }
      } catch (err) {
        console.error('Failed to delete activity:', err);
        const message = err?.response?.data?.error || err?.message || 'Failed to delete activity. Please try again.';
        alert(message);
      }
    }
  };

  // --- APPLICANT HANDLERS ---
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [applicantModalMode, setApplicantModalMode] = useState('add');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [viewApplicant, setViewApplicant] = useState(null);
  const [applicantFormData, setApplicantFormData] = useState({
    name: '',
    email: '',
    opportunity: '',
    sex: '',
    experience: '',
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'PENDING'
  });
  const [applicantFilter, setApplicantFilter] = useState({
    opportunity: 'all',
    sex: 'all',
    experience: 'all',
    status: 'all'
  });

  const handleOpenAddApplicant = () => {
    setApplicantModalMode('add');
    setSelectedApplicant(null);
    setApplicantFormData({
      name: '',
      email: '',
      opportunity: '',
      sex: '',
      experience: '',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    });
    setIsApplicantModalOpen(true);
  };

  const handleOpenEditApplicant = (applicant) => {
    setApplicantModalMode('edit');
    setSelectedApplicant(applicant);
    setApplicantFormData({
      name: applicant.name,
      email: applicant.email || '',
      opportunity: applicant.opportunity,
      sex: applicant.sex || '',
      experience: applicant.experience || '',
      appliedDate: applicant.appliedDate || new Date().toISOString().split('T')[0],
      status: applicant.status || 'PENDING'
    });
    setIsApplicantModalOpen(true);
  };

  const handleSaveApplicant = async (e) => {
    e.preventDefault();
    try {
      if (applicantModalMode === 'add') {
        const data = await apiFetch('/applicants', {
          method: 'POST',
          data: applicantFormData,
        });
        setApplicants([...applicants, data]);
      } else {
        const data = await apiFetch('/applicants/' + selectedApplicant.id, {
          method: 'PUT',
          data: applicantFormData,
        });
        setApplicants(applicants.map((a) => (a.id === data.id ? data : a)));
      }
      setIsApplicantModalOpen(false);
    } catch (err) {
      console.error('Failed to save applicant:', err);
    }
  };

  const handleDeleteApplicant = async (id) => {
    if (window.confirm('Are you sure you want to delete this applicant?')) {
      try {
        await apiFetch('/applicants/' + id, { method: 'DELETE' });
        setApplicants(applicants.filter((a) => a.id !== id));
      } catch (err) {
        console.error('Failed to delete applicant:', err);
      }
    }
  };

  const handleViewApplicant = (applicant) => {
    setViewApplicant(applicant);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const applicant = applicants.find(a => a.id === id);
      if (!applicant) return;
      
      const data = await apiFetch('/applicants/' + id, {
        method: 'PUT',
        data: { ...applicant, status: newStatus },
      });
      setApplicants(applicants.map((a) => (a.id === data.id ? data : a)));
    } catch (err) {
      console.error('Failed to update applicant status:', err);
    }
  };

  const getFilteredApplicants = () => {
    let filtered = [...applicants];
    
    if (applicantFilter.opportunity !== 'all') {
      filtered = filtered.filter(a => a.opportunity === applicantFilter.opportunity);
    }
    if (applicantFilter.sex !== 'all') {
      filtered = filtered.filter(a => a.sex === applicantFilter.sex);
    }
    if (applicantFilter.experience !== 'all') {
      filtered = filtered.filter(a => {
        if (applicantFilter.experience === '0-2 years') return a.experience && (a.experience.includes('0') || a.experience.includes('1') || a.experience.includes('2'));
        if (applicantFilter.experience === '3-5 years') return a.experience && (a.experience.includes('3') || a.experience.includes('4') || a.experience.includes('5'));
        if (applicantFilter.experience === '5+ years') return a.experience && parseInt(a.experience) > 5;
        return true;
      });
    }
    if (applicantFilter.status !== 'all') {
      filtered = filtered.filter(a => a.status === applicantFilter.status);
    }
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.opportunity.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getUniqueOpportunities = () => {
    return [...new Set(applicants.map(a => a.opportunity).filter(Boolean))];
  };

  const getUniqueExperiences = () => {
    return [...new Set(applicants.map(a => a.experience).filter(Boolean))];
  };

  const getApplicantStats = () => {
    const total = applicants.length;
    const pending = applicants.filter(a => a.status === 'PENDING').length;
    const reviewed = applicants.filter(a => a.status === 'REVIEWED').length;
    const accepted = applicants.filter(a => a.status === 'ACCEPTED').length;
    const rejected = applicants.filter(a => a.status === 'REJECTED').length;
    return { total, pending, reviewed, accepted, rejected };
  };

  // --- ADVISOR HANDLERS ---
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [advisorModalMode, setAdvisorModalMode] = useState('add');
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [viewAdvisor, setViewAdvisor] = useState(null);
  const [advisorFormData, setAdvisorFormData] = useState({
    name: '',
    message: '',
    role: 'Advisor',
    category: 'board',
    status: 'Active',
    order: 1,
  });
  const [advisorSaving, setAdvisorSaving] = useState(false);
  const [advisorError, setAdvisorError] = useState('');

  const handleOpenAddAdvisor = () => {
    setAdvisorModalMode('add');
    setSelectedAdvisor(null);
    setAdvisorFormData({
      name: '',
      message: '',
      role: 'Advisor',
      category: 'board',
      status: 'Active',
      order: advisors.length + 1,
    });
    setAdvisorError('');
    setIsAdvisorModalOpen(true);
  };

  const handleViewAdvisor = (advisor) => {
    setViewAdvisor(advisor);
  };

  const handleOpenEditAdvisor = (advisor) => {
    setAdvisorModalMode('edit');
    setSelectedAdvisor(advisor);
    setAdvisorFormData({
      name: advisor.name || '',
      message: advisor.message || '',
      role: advisor.role || 'Advisor',
      category: advisor.category || 'board',
      status: advisor.status || 'Active',
      order: advisor.order || 0,
    });
    setAdvisorError('');
    setIsAdvisorModalOpen(true);
  };

  const fetchAdvisors = async () => {
    try {
      const response = await fetch('/api/advisors');
      const data = await response.json();
      const mappedAdvisors = data.map((a) => ({
        id: a.id,
        name: (a.firstName || '') + ' ' + (a.lastName || ''),
        role: a.roleName || 'Advisor',
        category: a.category || 'board',
        status: a.isActive ? 'Active' : 'Inactive',
        order: a.order || 0,
        email: a.email || '',
        contact: a.contact || '',
        linkedIn: a.profileLink || '',
        message: a.message || '',
        imageUrl: a.imageUrl,
        profileLink: a.profileLink,
      }));
      setAdvisors(mappedAdvisors);
    } catch (err) {
      console.error('Failed to fetch advisors:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'board-of-advisors') {
      fetchAdvisors();
    }
  }, [activeTab]);

  const handleSaveAdvisor = async (e) => {
    e.preventDefault();
    setAdvisorError('');
    setAdvisorSaving(true);
    try {
      const name = advisorFormData.name.trim() || '';
      const role = advisorFormData.role.trim() || 'Advisor';
      const category = advisorFormData.category || 'board';
      
      if (!name) {
        setAdvisorError('Please enter a name.');
        setAdvisorSaving(false);
        return;
      }
      
      if (advisorModalMode === 'add') {
        const data = await apiFetch('/advisors', {
          method: 'POST',
          data: {
            firstName: name,
            role,
            category,
            advisorOrder: advisorFormData.order,
            message: advisorFormData.message,
            bio: advisorFormData.message,
            isActive: advisorFormData.status === 'Active',
          },
        });
        setAdvisors([...advisors, {
          id: data.id,
          name: advisorFormData.name,
          role: advisorFormData.role,
          category: category,
          status: advisorFormData.status,
          order: advisorFormData.order,
          message: advisorFormData.message,
          bio: advisorFormData.message,
        }]);
      } else {
        const data = await apiFetch('/advisors/' + selectedAdvisor.id, {
          method: 'PUT',
          data: {
            firstName: name,
            role,
            category,
            advisorOrder: advisorFormData.order,
            message: advisorFormData.message,
            bio: advisorFormData.message,
            isActive: advisorFormData.status === 'Active',
          },
        });
        setAdvisors(advisors.map((a) => (a.id === data.id ? {
          ...a,
          name: advisorFormData.name,
          role: advisorFormData.role,
          category: category,
          status: advisorFormData.status,
          order: advisorFormData.order,
          message: advisorFormData.message,
          bio: advisorFormData.message,
        } : a)));
      }
      setIsAdvisorModalOpen(false);
      fetchAdvisors();
    } catch (err) {
      console.error('Failed to save advisor:', err);
      setAdvisorError(err.response?.data?.error || 'Failed to save advisor. Please try again.');
    } finally {
      setAdvisorSaving(false);
    }
  };

  const handleDeleteAdvisor = async (id) => {
    if (window.confirm('Are you sure you want to delete this advisor?')) {
      try {
        await apiFetch('/advisors/' + id, { method: 'DELETE' });
        await fetchAdvisors();
      } catch (err) {
        console.error('Failed to delete advisor:', err);
      }
    }
  };

  // --- NEWS HANDLERS ---
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsModalMode, setNewsModalMode] = useState('add');
  const [selectedNews, setSelectedNews] = useState(null);
  const [viewNews, setViewNews] = useState(null);
  const [newsFormData, setNewsFormData] = useState({
    title: '',
    category: 'Company News',
    author: '',
    date: new Date().toISOString().split('T')[0],
    excerpt: '',
    content: '',
    imageUrl: ''
  });

  const handleOpenAddNews = () => {
    setNewsModalMode('add');
    setSelectedNews(null);
    setNewsFormData({
      title: '',
      category: 'Company News',
      author: '',
      date: new Date().toISOString().split('T')[0],
      excerpt: '',
      content: '',
      imageUrl: ''
    });
    setIsNewsModalOpen(true);
  };

  const handleOpenEditNews = (post) => {
    setNewsModalMode('edit');
    setSelectedNews(post);
    setNewsFormData({
      title: post.title,
      category: post.category || 'Company News',
      author: post.author || '',
      date: post.date || new Date().toISOString().split('T')[0],
      excerpt: post.excerpt || '',
      content: post.content || '',
      imageUrl: post.imageUrl || ''
    });
    setIsNewsModalOpen(true);
  };

  const handleSaveNews = async (e) => {
    e.preventDefault();
    try {
      if (newsModalMode === 'add') {
        const data = await apiFetch('/news', {
          method: 'POST',
          data: newsFormData,
        });
        setNewsPosts([data, ...newsPosts]);
      } else {
        const data = await apiFetch('/news/' + selectedNews.id, {
          method: 'PUT',
          data: newsFormData,
        });
        setNewsPosts(newsPosts.map((p) => (p.id === data.id ? data : p)));
      }
      setIsNewsModalOpen(false);
    } catch (err) {
      console.error('Failed to save news:', err);
    }
  };

  const handleViewNews = (post) => {
    setViewNews(post);
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm('Are you sure you want to delete this news post?')) {
      try {
        await apiFetch('/news/' + id, { method: 'DELETE' });
        setNewsPosts(newsPosts.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Failed to delete news:', err);
      }
    }
  };

  // --- SERVICE AGREEMENT HANDLERS ---
  const fetchServiceAgreements = async () => {
    try {
      const data = await apiFetch('/service-agreements');
      setServiceAgreements(data);
    } catch (err) {
      console.error('Failed to fetch service agreements:', err);
    }
  };

  const handleOpenAddAgreement = () => {
    setAgreementModalMode('add');
    setSelectedAgreement(null);
    setAgreementFormData({ title: '', content: '' });
    setGrammarResult('');
    setIsAgreementModalOpen(true);
  };

  const handleOpenEditAgreement = (agreement) => {
    setAgreementModalMode('edit');
    setSelectedAgreement(agreement);
    setAgreementFormData({ title: agreement.title, content: agreement.content || '' });
    setGrammarResult('');
    setIsAgreementModalOpen(true);
  };

  const handleSaveAgreement = async (e) => {
    e.preventDefault();
    try {
      if (agreementModalMode === 'add') {
        const data = await apiFetch('/service-agreements', {
          method: 'POST',
          data: agreementFormData,
        });
        setServiceAgreements([...serviceAgreements, data]);
      } else {
        const data = await apiFetch('/service-agreements/' + selectedAgreement.id, {
          method: 'PUT',
          data: agreementFormData,
        });
        setServiceAgreements(serviceAgreements.map((a) => (a.id === data.id ? data : a)));
      }
      setIsAgreementModalOpen(false);
      setGrammarResult('');
    } catch (err) {
      console.error('Failed to save agreement:', err);
    }
  };

  const handleDeleteAgreement = async (id) => {
    if (window.confirm('Are you sure you want to delete this service agreement?')) {
      try {
        await apiFetch('/service-agreements/' + id, { method: 'DELETE' });
        setServiceAgreements(serviceAgreements.filter((a) => a.id !== id));
      } catch (err) {
        console.error('Failed to delete agreement:', err);
      }
    }
  };

  const handleViewAgreement = (agreement) => {
    setViewAgreement(agreement);
  };

  // --- PRIVACY POLICY HANDLERS ---
  const fetchPrivacyPolicies = async () => {
    try {
      const data = await apiFetch('/privacy-policies');
      setPrivacyPolicies(data);
    } catch (err) {
      console.error('Failed to fetch privacy policies:', err);
    }
  };

  const handleOpenAddPrivacyPolicy = () => {
    setPrivacyPolicyModalMode('add');
    setSelectedPrivacyPolicy(null);
    setPrivacyPolicyFormData({ title: '', content: '' });
    setIsPrivacyPolicyModalOpen(true);
  };

  const handleOpenEditPrivacyPolicy = (policy) => {
    setPrivacyPolicyModalMode('edit');
    setSelectedPrivacyPolicy(policy);
    setPrivacyPolicyFormData({ title: policy.title, content: policy.content || '' });
    setIsPrivacyPolicyModalOpen(true);
  };

  const handleSavePrivacyPolicy = async (e) => {
    e.preventDefault();
    try {
      if (privacyPolicyModalMode === 'add') {
        const data = await apiFetch('/privacy-policies', {
          method: 'POST',
          data: privacyPolicyFormData,
        });
        setPrivacyPolicies([...privacyPolicies, data]);
      } else {
        const data = await apiFetch('/privacy-policies/' + selectedPrivacyPolicy.id, {
          method: 'PUT',
          data: privacyPolicyFormData,
        });
        setPrivacyPolicies(privacyPolicies.map((p) => (p.id === data.id ? data : p)));
      }
      setIsPrivacyPolicyModalOpen(false);
    } catch (err) {
      console.error('Failed to save privacy policy:', err);
    }
  };

  const handleDeletePrivacyPolicy = async (id) => {
    if (window.confirm('Are you sure you want to delete this privacy policy?')) {
      try {
        await apiFetch('/privacy-policies/' + id, { method: 'DELETE' });
        setPrivacyPolicies(privacyPolicies.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Failed to delete privacy policy:', err);
      }
    }
  };

  const handleViewPrivacyPolicy = (policy) => {
    setViewPrivacyPolicy(policy);
  };

  // --- JURISDICTION HANDLERS ---
  const fetchJurisdictions = async () => {
    try {
      const data = await apiFetch('/jurisdictions');
      setJurisdictions(data);
    } catch (err) {
      console.error('Failed to fetch jurisdictions:', err);
    }
  };

  const handleOpenAddJurisdiction = () => {
    setJurisdictionModalMode('add');
    setSelectedJurisdiction(null);
    setJurisdictionFormData({ country: '', entity_type: '', lead_entity: '', primary_law: '', additional_laws: '' });
    setIsJurisdictionModalOpen(true);
  };

  const handleOpenEditJurisdiction = (jurisdiction) => {
    setJurisdictionModalMode('edit');
    setSelectedJurisdiction(jurisdiction);
    setJurisdictionFormData({
      country: jurisdiction.country,
      entity_type: jurisdiction.entity_type || '',
      lead_entity: jurisdiction.lead_entity || '',
      primary_law: jurisdiction.primary_law || '',
      additional_laws: jurisdiction.additional_laws || ''
    });
    setIsJurisdictionModalOpen(true);
  };

  const handleSaveJurisdiction = async (e) => {
    e.preventDefault();
    try {
      if (jurisdictionModalMode === 'add') {
        const data = await apiFetch('/jurisdictions', {
          method: 'POST',
          data: jurisdictionFormData,
        });
        setJurisdictions([...jurisdictions, data]);
      } else {
        const data = await apiFetch('/jurisdictions/' + selectedJurisdiction.id, {
          method: 'PUT',
          data: jurisdictionFormData,
        });
        setJurisdictions(jurisdictions.map((j) => (j.id === data.id ? data : j)));
      }
      setIsJurisdictionModalOpen(false);
    } catch (err) {
      console.error('Failed to save jurisdiction:', err);
    }
  };

  const handleDeleteJurisdiction = async (id) => {
    if (window.confirm('Are you sure you want to delete this jurisdiction?')) {
      try {
        await apiFetch('/jurisdictions/' + id, { method: 'DELETE' });
        setJurisdictions(jurisdictions.filter((j) => j.id !== id));
      } catch (err) {
        console.error('Failed to delete jurisdiction:', err);
      }
    }
  };

  const handleViewJurisdiction = (jurisdiction) => {
    setViewJurisdiction(jurisdiction);
  };

  // --- CONTACT HANDLERS ---
  const fetchContacts = async () => {
    try {
      const data = await apiFetch('/contacts');
      setContacts(data);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const handleOpenAddContact = () => {
    setContactModalMode('add');
    setSelectedContact(null);
    setContactFormData({ placeholder_id: '', contact_point: '', purpose_context: '', section: '', category: 'general' });
    setIsContactModalOpen(true);
  };

  const handleOpenEditContact = (contact) => {
    setContactModalMode('edit');
    setSelectedContact(contact);
    setContactFormData({
      placeholder_id: contact.placeholder_id || '',
      contact_point: contact.contact_point,
      purpose_context: contact.purpose_context || '',
      section: contact.section || '',
      category: contact.category || 'general'
    });
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    try {
      if (contactModalMode === 'add') {
        const data = await apiFetch('/contacts', {
          method: 'POST',
          data: contactFormData,
        });
        setContacts([...contacts, data]);
      } else {
        const data = await apiFetch('/contacts/' + selectedContact.id, {
          method: 'PUT',
          data: contactFormData,
        });
        setContacts(contacts.map((c) => (c.id === data.id ? data : c)));
      }
      setIsContactModalOpen(false);
    } catch (err) {
      console.error('Failed to save contact:', err);
    }
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await apiFetch('/contacts/' + id, { method: 'DELETE' });
        setContacts(contacts.filter((c) => c.id !== id));
      } catch (err) {
        console.error('Failed to delete contact:', err);
      }
    }
  };

  const handleViewContact = (contact) => {
    setViewContact(contact);
  };

  // --- FETCH FUNCTIONS ---
  const fetchProducts = async () => {
    try {
      const data = await apiFetch('/products');
      const mapped = data.map((p) => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        category: p.category || 'General',
        iconType: p.iconType || 'trending',
        status: 'Active',
        version: '1.0.0',
        lastUpdated: p.lastUpdated || new Date().toISOString().split('T')[0],
        logoUrl: p.logoUrl || '',
        description: p.description || '',
        keyFeatures: Array.isArray(p.keyFeatures) ? p.keyFeatures : [],
      }));
      setProducts(mapped);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchPricing = async () => {
    try {
      const data = await apiFetch('/pricing');
      setPricing(data);
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
    }
  };

  const decodeToken = () => {
    try {
      const token = localStorage.getItem('cms_auth_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
      }
    } catch (err) {
      console.error('Failed to decode token:', err);
    }
    return null;
  };

  const fetchCurrentUser = async () => {
    try {
      const tokenData = decodeToken();
      if (tokenData && tokenData.id) {
        const data = await apiFetch('/admin/users/' + tokenData.id);
        setCurrentUser(data);
        setAccountFormData({ username: data.username || '', currentPassword: '', newPassword: '' });
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setAccountMessage('');
    setAccountError('');
    try {
      const tokenData = decodeToken();
      if (!tokenData || !tokenData.id) {
        setAccountError('Unable to identify current user. Please login again.');
        return;
      }
      const updateData = {};
      if (accountFormData.username && accountFormData.username !== currentUser?.username) {
        updateData.username = accountFormData.username;
      }
      if (accountFormData.newPassword) {
        if (!accountFormData.currentPassword) {
          setAccountError('Please enter your current password to set a new password.');
          return;
        }
        updateData.password = accountFormData.newPassword;
      }
      if (Object.keys(updateData).length === 0) {
        setAccountError('No changes to update.');
        return;
      }
      const data = await apiFetch('/admin/users/' + tokenData.id, {
        method: 'PUT',
        data: updateData,
      });
      setCurrentUser(data);
      setAccountFormData({ username: data.username || '', currentPassword: '', newPassword: '' });
      setAccountMessage('Account updated successfully!');
      setTimeout(() => setAccountMessage(''), 3000);
    } catch (err) {
      setAccountError(err.response?.data?.error || 'Failed to update account. Please try again.');
    }
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleToggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
  };

  const fetchPartners = async () => {
    try {
      const data = await apiFetch('/partners');
      setPartners(data);
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const data = await apiFetch('/jobs');
      setOpportunities(data);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    }
  };

  const fetchJobOpportunities = async () => {
    try {
      const data = await apiFetch('/jobs');
      setJobOpportunities(data);
      if (activeTab === 'dashboard') {
        setAnimateCharts(true);
      }
    } catch (err) {
      console.error('Failed to fetch job opportunities:', err);
    }
  };

  const fetchApplicants = async () => {
    try {
      const data = await apiFetch('/applicants');
      setApplicants(data);
    } catch (err) {
      console.error('Failed to fetch applicants:', err);
    }
  };

  const fetchEmails = async () => {
    try {
      const data = await apiFetch('/messages');
      setEmails(data);
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    }
  };

  const fetchNewsPosts = async () => {
    try {
      const data = await apiFetch('/news');
      setNewsPosts(data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    }
  };

  // --- PRICING HANDLERS ---
  const handleOpenAddPricing = () => {
    setPricingModalMode('add');
    setSelectedPricing(null);
    setPricingFormData({ plan: '', price: '', features: '', popular: false, display_order: 0 });
    setIsPricingModalOpen(true);
  };

  const handleOpenEditPricing = (pricingItem) => {
    setPricingModalMode('edit');
    setSelectedPricing(pricingItem);
    const features = Array.isArray(pricingItem.features)
      ? pricingItem.features
      : typeof pricingItem.features === 'string'
        ? JSON.parse(pricingItem.features)
        : [];
    setPricingFormData({
      plan: pricingItem.plan,
      price: pricingItem.price.toString(),
      features: features.join('\n'),
      popular: !!pricingItem.popular,
      display_order: pricingItem.display_order || 0
    });
    setIsPricingModalOpen(true);
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    try {
      const featuresArray = pricingFormData.features.split('\n').map(f => f.trim()).filter(f => f);
      if (pricingModalMode === 'add') {
        const data = await apiFetch('/pricing', {
          method: 'POST',
          data: {
            plan: pricingFormData.plan,
            price: parseFloat(pricingFormData.price) || 0,
            features: JSON.stringify(featuresArray),
            popular: pricingFormData.popular,
            display_order: pricingFormData.display_order
          },
        });
        setPricing([...pricing, data]);
      } else {
        const data = await apiFetch('/pricing/' + selectedPricing.id, {
          method: 'PUT',
          data: {
            plan: pricingFormData.plan,
            price: parseFloat(pricingFormData.price) || 0,
            features: JSON.stringify(featuresArray),
            popular: pricingFormData.popular,
            display_order: pricingFormData.display_order
          },
        });
        setPricing(pricing.map((p) => (p.id === data.id ? data : p)));
      }
      setIsPricingModalOpen(false);
    } catch (err) {
      console.error('Failed to save pricing:', err);
    }
  };

  const handleDeletePricing = async (id) => {
    if (window.confirm('Are you sure you want to delete this pricing plan?')) {
      try {
        await apiFetch('/pricing/' + id, { method: 'DELETE' });
        setPricing(pricing.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Failed to delete pricing:', err);
      }
    }
  };

  const handleViewPricing = (pricingItem) => {
    const features = Array.isArray(pricingItem.features)
      ? pricingItem.features
      : typeof pricingItem.features === 'string'
        ? JSON.parse(pricingItem.features)
        : [];
    setViewPricing({ ...pricingItem, features });
  };

  const toggleCollapse = (id) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkGrammar = async () => {
    setGrammarChecking(true);
    setGrammarResult('');
    try {
      const text = agreementFormData.content || agreementFormData.title;
      const response = await axios.post('https://api.languagetool.org/v2/check', new URLSearchParams({
        text: text,
        language: 'en-US',
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const matches = response.data.matches;
      if (matches && matches.length > 0) {
        const issues = matches.map((m) => `â€¢ ${m.message} (${m.shortMessage})`).join('\n');
        setGrammarResult('Grammar issues found:\n\n' + issues);
      } else {
        setGrammarResult('No grammar issues found!');
      }
    } catch (err) {
      console.error('Grammar check error:', err);
      setGrammarResult('Grammar check service unavailable. Please try again later.');
    } finally {
      setGrammarChecking(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
      .replace(/^### (.*$)/gim, '<div class="mt-3 mb-2"><div class="flex items-center gap-2 mb-1"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#f0f9e8] text-[#72bf24] text-[10px] font-bold border border-[#d3f0b4] shrink-0">Â§</span><h3 class="text-sm font-bold text-slate-900">$1</h3></div><div class="pl-7 text-sm text-slate-700 leading-relaxed">')
      .replace(/^## (.*$)/gim, '<div class="mt-4 mb-2"><div class="flex items-center gap-2 mb-1"><span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 shrink-0">Â¶</span><h2 class="text-base font-bold text-slate-900">$1</h2></div><div class="pl-7 text-sm text-slate-700 leading-relaxed">')
      .replace(/^# (.*$)/gim, '<div class="mb-4 mt-2"><div class="flex items-center gap-2 mb-2"><span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#72bf24] text-white text-xs font-bold shrink-0">Â§</span><h1 class="text-lg font-bold text-slate-900">$1</h1></div><div class="pl-8 text-sm text-slate-700 leading-relaxed">')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\s*-\s(.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>')
      .replace(/\n/g, '<br />');
    return html;
  };

  // --- FILTERS ---
  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.tagline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPartners = partners.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobOpportunities = jobOpportunities.filter(
    (j) => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplicants = getFilteredApplicants();

  const filteredEmails = emails.filter(
    (e) =>
      e.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNews = newsPosts.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdvisors = advisors.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.contact && a.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredManagementTeam = advisors.filter(
    (a) =>
      (a.category || 'board') === 'management' &&
      (a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.contact && a.contact.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const filteredMilestones = milestones
    .slice()
    .sort((a, b) => Number(b.year) - Number(a.year))
    .filter(
      (m) =>
        String(m.year).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.title && m.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  // --- ICON RENDERER ---
  const renderProductIcon = (type) => {
    const iconType = type || 'trending';
    switch (iconType) {
      case 'trending':
        return <TrendingUp className="w-5 h-5 text-[#72bf24]" />;
      case 'users':
      case 'user':
        return <UserCheck className="w-5 h-5 text-[#72bf24]" />;
      case 'file':
      case 'document':
        return <FileText className="w-5 h-5 text-[#72bf24]" />;
      default:
        return <Layers className="w-5 h-5 text-[#72bf24]" />;
    }
  };

  // --- CHART DATA ---
  const weeklyData = [
    { day: 'Mon', received: 10, sent: 8 },
    { day: 'Tue', received: 19, sent: 15 },
    { day: 'Wed', received: 15, sent: 10 },
    { day: 'Thu', received: 22, sent: 17 },
    { day: 'Fri', received: 29, sent: 25 },
    { day: 'Sat', received: 9, sent: 7 },
    { day: 'Sun', received: 8, sent: 5 }
  ];

  const maxValue = Math.max(...weeklyData.flatMap(d => [d.received, d.sent]));

  const mailboxData = [
    { label: 'Read', value: 1284, color: '#72bf24' },
    { label: 'Replied', value: 856, color: '#3b82f6' },
    { label: 'Unread', value: 423, color: '#94a3b8' }
  ];
  const totalMailbox = mailboxData.reduce((sum, item) => sum + item.value, 0);

  const [stats, setStats] = useState({
    comments: 0,
    views: 0,
    subscribers: 0
  });

  const [viewStatsDetail, setViewStatsDetail] = useState(null);

  useEffect(() => {
    if (activeTab === 'legal-service-agreement') {
      fetchServiceAgreements();
    }
    if (activeTab === 'legal-jurisdictions') {
      fetchJurisdictions();
    }
    if (activeTab === 'legal-contact-info') {
      fetchContacts();
    }
    if (activeTab === 'legal-privacy-policy') {
      fetchPrivacyPolicies();
    }
  }, [activeTab]);

  // --- APPLICANTS PER OPPORTUNITY ---
  const [applicantsPerOpportunity, setApplicantsPerOpportunity] = useState([]);

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  const renderLegalContent = () => {
    const tabMap = {
      'service-agreement': { title: 'Service Agreement', icon: FileSignature },
      'agreement-history': { title: 'Agreement History', icon: BookOpen },
      'jurisdictions': { title: 'Jurisdictions', icon: Globe },
      'contact-info': { title: 'Contact Information', icon: MailIcon },
      'privacy-policy': { title: 'Privacy Policy', icon: Shield }
    };

    const currentTab = activeTab.split('-').slice(1).join('-') || 'service-agreement';
    const meta = tabMap[currentTab] || tabMap['service-agreement'];

    if (currentTab === 'service-agreement') {
      return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Service Agreement</h1>
              <p className="text-sm text-slate-500 mt-1">Manage service agreement sections and content</p>
            </div>
            <button
              onClick={handleOpenAddAgreement}
              className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Section</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {serviceAgreements.length > 0 ? (
              serviceAgreements.map((agreement) => (
                <div key={agreement.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#f0f9e8] border border-[#d3f0b4] flex items-center justify-center shrink-0">
                        <FileSignature className="w-5 h-5 text-[#72bf24]" />
                      </div>
                      <button
                        onClick={() => handleViewAgreement(agreement)}
                        className="flex-1 min-w-0 text-left cursor-pointer group"
                        title="View full agreement"
                      >
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#72bf24] transition-colors truncate">{agreement.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(agreement.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleViewAgreement(agreement)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-blue-600"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditAgreement(agreement)}
                        className="p-2 hover:bg-green-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-[#72bf24]"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAgreement(agreement.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {agreement.content && (
                    <div className="px-5 pb-5 pl-[74px]">
                      <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-100">
                        <div className="text-sm text-slate-700 leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: renderMarkdown(agreement.content) }}></div>
                        <button
                          onClick={() => handleViewAgreement(agreement)}
                          className="text-[#72bf24] text-xs font-semibold mt-2 hover:underline transition-colors"
                        >
                          Read more...
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <FileSignature className="w-12 h-12 text-slate-300" />
                  <span className="text-sm text-slate-400">No service agreement sections found.</span>
                  <button
                    onClick={handleOpenAddAgreement}
                    className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                  >
                    Add your first section
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentTab === 'jurisdictions') {
      return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Jurisdictions</h1>
              <p className="text-sm text-slate-500 mt-1">Manage jurisdiction information</p>
            </div>
            <button
              onClick={handleOpenAddJurisdiction}
              className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Jurisdiction</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 tracking-wider">
                    <th className="py-4 pl-6">COUNTRY</th>
                    <th className="py-4">ENTITY TYPE</th>
                    <th className="py-4">LEAD ENTITY</th>
                    <th className="py-4 pr-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jurisdictions.length > 0 ? (
                    jurisdictions.map((jurisdiction) => (
                      <tr key={jurisdiction.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                        <td className="py-4 pl-6 text-sm font-semibold text-slate-900">{jurisdiction.country}</td>
                        <td className="py-4 text-sm text-slate-600">{jurisdiction.entity_type || '-'}</td>
                        <td className="py-4 text-sm text-slate-600">{jurisdiction.lead_entity || '-'}</td>
                        <td className="py-4 pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewJurisdiction(jurisdiction)}
                              className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditJurisdiction(jurisdiction)}
                              className="p-1.5 hover:text-[#72bf24] hover:bg-green-50 rounded-lg transition-all duration-300"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJurisdiction(jurisdiction.id)}
                              className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Globe className="w-12 h-12 text-slate-300" />
                          <span className="text-sm text-slate-400">No jurisdictions found.</span>
                          <button
                            onClick={handleOpenAddJurisdiction}
                            className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                          >
                            Add your first jurisdiction
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (currentTab === 'contact-info') {
      const legalContacts = contacts.filter(c => c.category === 'legal');
      const generalContacts = contacts.filter(c => c.category === 'general');
      const socialContacts = contacts.filter(c => c.category === 'social_media');

      const ContactTable = ({ contacts: sectionContacts, columns, emptyText }) => (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col max-h-[45vh]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <h3 className="text-sm font-semibold text-slate-900">{emptyText}</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 sticky top-0">
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 tracking-wider">
                  {columns.map((col) => (
                    <th key={col.key} className="py-3 pl-4 pr-2 text-left uppercase">{col.label}</th>
                  ))}
                  <th className="py-3 pr-4 text-right uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sectionContacts.length > 0 ? (
                  sectionContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                      {columns.map((col) => (
                        <td key={col.key} className="py-3 pl-4 pr-2 text-sm text-slate-600 align-top">
                          {col.render ? col.render(contact[col.key], contact) : (contact[col.key] || '-')}
                        </td>
                      ))}
                      <td className="py-3 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleViewContact(contact)} className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleOpenEditContact(contact)} className="p-1.5 hover:text-[#72bf24] hover:bg-green-50 rounded-lg transition-all duration-300" title="Edit"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteContact(contact.id)} className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="py-10 text-center">
                      <p className="text-xs text-slate-400">{emptyText} - No entries yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );

      return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Contact Information Management</h1>
              <p className="text-sm text-slate-500 mt-1">Manage company contact details and social media links</p>
            </div>
            <button
              onClick={handleOpenAddContact}
              className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Contact</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            <ContactTable
              contacts={legalContacts}
              columns={[
                { key: 'placeholder_id', label: 'ID' },
                { key: 'contact_point', label: 'Contact Point' },
                { key: 'purpose_context', label: 'Purpose' },
                { key: 'section', label: 'Sections' }
              ]}
              emptyText="Legal Compliance Directory"
            />

            <ContactTable
              contacts={generalContacts}
              columns={[
                { key: 'placeholder_id', label: 'ID' },
                { key: 'contact_point', label: 'Contact Point', render: (value) => {
                  if (!value) return '-';
                  if (value.startsWith('http://') || value.startsWith('https://')) {
                    return <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#72bf24] hover:underline transition-colors">{value}</a>;
                  }
                  return value;
                }},
                { key: 'purpose_context', label: 'Purpose' },
                { key: 'section', label: 'Location' }
              ]}
              emptyText="General Contact Directory"
            />

            <ContactTable
              contacts={socialContacts}
              columns={[
                { key: 'placeholder_id', label: 'ID' },
                { key: 'contact_point', label: 'Contact Point', render: (value) => {
                  if (!value) return '-';
                  if (value.startsWith('http://') || value.startsWith('https://')) {
                    return <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#72bf24] hover:underline transition-colors">{value}</a>;
                  }
                  return value;
                }},
                { key: 'purpose_context', label: 'Purpose' },
                { key: 'section', label: 'Platform / Context' }
              ]}
              emptyText="Social Media Handles"
            />
          </div>
        </div>
      );
    }

    if (currentTab === 'privacy-policy') {
      return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-slate-500 mt-1">Manage privacy policy content</p>
            </div>
            <button
              onClick={handleOpenAddPrivacyPolicy}
              className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Policy</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8fafc]">
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider">
                    <th className="py-4 pl-6">TITLE</th>
                    <th className="py-4">CREATED</th>
                    <th className="py-4 pr-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {privacyPolicies.length > 0 ? (
                    privacyPolicies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                        <td className="py-5 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#f0f9e8] border border-[#d3f0b4] flex items-center justify-center shrink-0">
                              <Shield className="w-5 h-5 text-[#72bf24]" />
                            </div>
                            <button
                              onClick={() => handleViewPrivacyPolicy(policy)}
                              className="font-semibold text-slate-900 text-base text-left hover:text-[#72bf24] transition-colors cursor-pointer"
                              title="View privacy policy"
                            >
                              {policy.title}
                            </button>
                          </div>
                        </td>
                        <td className="py-5 text-sm text-slate-600">
                          {new Date(policy.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-5 pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewPrivacyPolicy(policy)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-blue-600"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditPrivacyPolicy(policy)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-[#72bf24]"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePrivacyPolicy(policy.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Shield className="w-12 h-12 text-slate-300" />
                          <span className="text-sm text-slate-400">No privacy policies found.</span>
                          <button
                            onClick={handleOpenAddPrivacyPolicy}
                            className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                          >
                            Add your first privacy policy
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    const data = legalData[currentTab] || legalData['agreement-history'];
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{meta.title}</h1>
            <p className="text-sm text-slate-500 mt-1">Manage {meta.title.toLowerCase()} information</p>
          </div>
          <button className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 tracking-wider">
                  {Object.keys(data[0] || {}).filter(key => key !== 'id').map((key) => (
                    <th key={key} className="pb-4 pl-2 uppercase">{key.replace(/-/g, ' ')}</th>
                  ))}
                  <th className="pb-4 text-right pr-2">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                    {Object.entries(item).filter(([key]) => key !== 'id').map(([key, value]) => (
                      <td key={key} className="py-4 pl-2 text-sm text-slate-600">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                      </td>
                    ))}
                    <td className="py-4 pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:text-[#72bf24] hover:bg-green-50 rounded-lg transition-all duration-300">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
           </div>
         </div>
         </div>
        );
      };


  // ============================================================
  // MAIN RETURN
  // ============================================================

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .admin-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .admin-table th {
          padding: 14px 20px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .admin-table td {
          padding: 16px 20px;
          font-size: 14px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }
        .admin-table tr:hover td {
          background: #f8fafc;
        }
        .admin-table .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .admin-table .action-btn:hover {
          transform: translateY(-1px);
        }
        .sidebar-accordion-content {
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin 0.3s ease;
        }
        .nav-item-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 0.375rem;
          background: #F5F5F5;
          transition: transform 0.2s ease, background 0.2s ease;
          padding: 0;
        }
        button:hover .nav-item-icon {
          transform: scale(1.08);
          background: #e2e8f0;
        }
        button.bg-\\[\\#72bf24\\] .nav-item-icon,
        button:hover .nav-item-icon {
          background: #e2e8f0;
        }
        button.bg-\\[\\#72bf24\\] .nav-item-icon {
          background: rgba(255, 255, 255, 0.2);
        }

        .admin-dark-mode {
          background: #0f172a !important;
          color: #e2e8f0 !important;
        }
        .admin-dark-mode aside {
          background: #1e293b !important;
          border-color: #334155 !important;
        }
        .admin-dark-mode .bg-white {
          background: #1e293b !important;
          color: #e2e8f0 !important;
        }
        .admin-dark-mode .text-slate-900 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-slate-800 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-slate-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-slate-600 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-slate-500 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-slate-400 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-gray-900,
        .admin-dark-mode .text-gray-800,
        .admin-dark-mode .text-gray-700,
        .admin-dark-mode .text-gray-600,
        .admin-dark-mode .text-gray-500,
        .admin-dark-mode .text-gray-400 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-red-600,
        .admin-dark-mode .text-red-500,
        .admin-dark-mode .text-red-400,
        .admin-dark-mode .text-red-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-blue-600,
        .admin-dark-mode .text-blue-500,
        .admin-dark-mode .text-blue-400,
        .admin-dark-mode .text-blue-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-green-600,
        .admin-dark-mode .text-green-500,
        .admin-dark-mode .text-green-400,
        .admin-dark-mode .text-green-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-yellow-600,
        .admin-dark-mode .text-yellow-500,
        .admin-dark-mode .text-yellow-400,
        .admin-dark-mode .text-yellow-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-orange-600,
        .admin-dark-mode .text-orange-500,
        .admin-dark-mode .text-orange-400,
        .admin-dark-mode .text-orange-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-purple-600,
        .admin-dark-mode .text-purple-500,
        .admin-dark-mode .text-purple-400,
        .admin-dark-mode .text-purple-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-pink-600,
        .admin-dark-mode .text-pink-500,
        .admin-dark-mode .text-pink-400,
        .admin-dark-mode .text-pink-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-indigo-600,
        .admin-dark-mode .text-indigo-500,
        .admin-dark-mode .text-indigo-400,
        .admin-dark-mode .text-indigo-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-teal-600,
        .admin-dark-mode .text-teal-500,
        .admin-dark-mode .text-teal-400,
        .admin-dark-mode .text-teal-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-cyan-600,
        .admin-dark-mode .text-cyan-500,
        .admin-dark-mode .text-cyan-400,
        .admin-dark-mode .text-cyan-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-emerald-600,
        .admin-dark-mode .text-emerald-500,
        .admin-dark-mode .text-emerald-400,
        .admin-dark-mode .text-emerald-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-amber-600,
        .admin-dark-mode .text-amber-500,
        .admin-dark-mode .text-amber-400,
        .admin-dark-mode .text-amber-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-rose-600,
        .admin-dark-mode .text-rose-500,
        .admin-dark-mode .text-rose-400,
        .admin-dark-mode .text-rose-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .text-lime-600,
        .admin-dark-mode .text-lime-500,
        .admin-dark-mode .text-lime-400,
        .admin-dark-mode .text-lime-700 {
          color: #84cc16 !important;
        }
        .admin-dark-mode .border-slate-200 {
          border-color: #334155 !important;
        }
        .admin-dark-mode .border-slate-100 {
          border-color: #334155 !important;
        }
        .admin-dark-mode .border-slate-300 {
          border-color: #475569 !important;
        }
        .admin-dark-mode .bg-slate-50 {
          background: #1e293b !important;
        }
        .admin-dark-mode .bg-slate-100 {
          background: #334155 !important;
        }
        .admin-dark-mode .bg-slate-200 {
          background: #475569 !important;
        }
        .admin-dark-mode .hover\\:bg-slate-50:hover {
          background: #334155 !important;
        }
        .admin-dark-mode .hover\\:bg-slate-100:hover {
          background: #475569 !important;
        }
        .admin-dark-mode .hover\\:bg-slate-200:hover {
          background: #64748b !important;
        }
        .admin-dark-mode input,
        .admin-dark-mode select,
        .admin-dark-mode textarea {
          background: #334155 !important;
          border-color: #475569 !important;
          color: #e2e8f0 !important;
        }
        .admin-dark-mode input::placeholder,
        .admin-dark-mode textarea::placeholder {
          color: #94a3b8 !important;
        }
        .admin-dark-mode .bg-\\[\\#f8fafc\\] {
          background: #334155 !important;
        }
        .admin-dark-mode table {
          background: #1e293b !important;
        }
        .admin-dark-mode thead {
          background: #334155 !important;
        }
        .admin-dark-mode tbody tr:hover td {
          background: #334155 !important;
        }
        .admin-dark-mode .bg-slate-300 {
          background: #475569 !important;
        }
        .admin-dark-mode .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3) !important;
        }
        .admin-dark-mode .shadow-md {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3) !important;
        }
        .admin-dark-mode .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3) !important;
        }

        /* Smooth transitions */
        .transition-smooth {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -6px rgba(0, 0, 0, 0.15);
        }
        .hover-scale {
          transition: transform 0.3s ease;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }

        /* Dedicated form workspaces â€” add and edit actions feel like focused pages. */
        .admin-app {
          background:
            radial-gradient(circle at 78% -8%, rgba(114, 191, 36, 0.13), transparent 30%),
            radial-gradient(circle at 10% 100%, rgba(16, 185, 129, 0.08), transparent 28%),
            #f8fafc;
        }
        .admin-app .admin-sidebar {
          box-shadow: 18px 0 45px rgba(15, 23, 42, 0.035);
        }
        .admin-app .fixed.inset-0:has(.bg-white) {
          align-items: stretch;
          justify-content: stretch;
          padding: 0;
          background: #f8fafc;
          backdrop-filter: none;
        }
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white {
          width: 100%;
          max-width: none;
          min-height: 100vh;
          height: 100vh;
          max-height: none;
          overflow-y: auto;
          border: 0;
          border-radius: 0;
          padding: clamp(2rem, 5vw, 4.5rem) clamp(1.5rem, 9vw, 10rem);
          box-shadow: none;
          background:
            linear-gradient(135deg, rgba(114, 191, 36, 0.08), transparent 35%),
            #ffffff;
          animation: adminFormEnter 360ms cubic-bezier(.16, 1, .3, 1) both;
        }
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:first-child {
          max-width: 940px;
          margin-left: auto;
          margin-right: auto;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:first-child h3 {
          font-size: clamp(1.5rem, 2vw, 2rem);
          letter-spacing: -0.035em;
        }
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:first-child button {
          transition: transform 0.3s ease;
        }
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:first-child button:hover {
          transform: rotate(90deg);
        }
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:not(:first-child) {
          max-width: 940px;
          margin-left: auto;
          margin-right: auto;
        }
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:not(:first-child) .space-y-4,
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > .space-y-4,
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:not(:first-child) > div {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          padding: clamp(1.25rem, 3vw, 2.25rem);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        }
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:not(:first-child) .space-y-4 label,
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:not(:first-child) .text-xs.font-semibold {
          color: #334155;
          font-size: 0.75rem;
          letter-spacing: 0.025em;
        }
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:not(:first-child) input,
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:not(:first-child) textarea,
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:not(:first-child) select {
          border-color: #dbe4ee;
          background: #fbfdff;
          padding: 0.7rem 0.9rem;
          box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.025);
        }
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:not(:first-child) input:focus,
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:not(:first-child) textarea:focus,
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white > div:not(:first-child) select:focus {
          border-color: #72bf24;
          box-shadow: 0 0 0 4px rgba(114, 191, 36, 0.13);
        }
        .admin-app .fixed.inset-0:has(.bg-white) > .bg-white form > .flex:last-child {
          position: sticky;
          bottom: -2.25rem;
          margin: 1.75rem -2.25rem -2.25rem;
          padding: 1rem 2.25rem;
          background: rgba(255, 255, 255, 0.95);
          border-top: 1px solid #e2e8f0;
          backdrop-filter: blur(12px);
        }
        @keyframes adminFormEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 768px) {
          .admin-app .fixed.inset-0:has(.bg-white) > .bg-white form {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 1.5rem;
          }
          .admin-app .fixed.inset-0:has(.bg-white) > .bg-white form > :nth-last-child(2),
          .admin-app .fixed.inset-0:has(.bg-white) > .bg-white form > :last-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 767px) {
          .admin-app .fixed.inset-0:has(.bg-white) > .bg-white form > .flex:last-child {
            bottom: -1.25rem;
            margin: 1.25rem -1.25rem -1.25rem;
            padding: 1rem 1.25rem;
          }
        }
      `}</style>
      <div className={`admin-app flex h-screen bg-slate-50/50 text-slate-800 font-sans antialiased overflow-hidden backdrop-blur-sm ${darkMode ? 'admin-dark-mode' : ''}`} style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {/* Sidebar Navigation */}
        <aside className="w-72 bg-white/95 border-r border-slate-200/80 flex flex-col p-8 gap-5 shrink-0 backdrop-blur-xl relative admin-sidebar">
          {/* Vertical nav indicator line */}
          <div className="absolute left-[22px] top-24 bottom-20 w-[2px] bg-slate-300/80 rounded-full"></div>

           <div className="text-2xl font-semibold tracking-wide px-2 py-2 select-none transition-transform duration-300 hover:scale-[1.02]">
            <Logo textClassName="text-[#72bf24]" showText={true} />
          </div>

           <nav className="flex-1 overflow-y-auto flex flex-col gap-1 text-[13px] font-medium custom-scrollbar relative">
            {/* Dashboard Tab */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 w-full text-left cursor-pointer relative z-10 ${
                activeTab === 'dashboard' ? 'bg-[#72bf24] text-white shadow-md shadow-[#72bf24]/20' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4 relative z-10 nav-item-icon" />
                <span>Dashboard</span>
              </div>
            </button>

            {/* Products Dropdown Accordion */}
            <div>
              <button
                onClick={() => toggleAccordion('products')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 w-full text-left cursor-pointer relative z-10 ${
                  activeTab === 'products' || activeTab === 'pricing'
                    ? 'bg-[#72bf24] text-white shadow-md shadow-[#72bf24]/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Box className="w-4 h-4 relative z-10 nav-item-icon" />
                  <span>Products</span>
                </div>
                {openAccordions.products ? <ChevronUp className="w-5 h-5 relative z-10 transition-transform duration-300" /> : <ChevronDown className="w-5 h-5 text-slate-400 relative z-10 transition-transform duration-300" />}
              </button>

              {openAccordions.products && (
                <div className="pl-12 flex flex-col gap-2.5 mt-2 text-sm sidebar-accordion-content" style={{ maxHeight: '120px', opacity: 1 }}>
                  <span
                    onClick={() => setActiveTab('products')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'products' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    All Products
                  </span>
                  <span
                    onClick={() => setActiveTab('pricing')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'pricing' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Pricing
                  </span>
                </div>
              )}
            </div>

            {/* Services Dropdown Accordion */}
            <div>
              <button
                onClick={() => toggleAccordion('services')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 w-full text-left cursor-pointer relative z-10 ${
                  activeTab === 'services'
                    ? 'bg-[#72bf24] text-white shadow-md shadow-[#72bf24]/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Box className="w-4 h-4 relative z-10 nav-item-icon" />
                  <span>Services</span>
                </div>
                {openAccordions.services ? <ChevronUp className="w-5 h-5 relative z-10 transition-transform duration-300" /> : <ChevronDown className="w-5 h-5 text-slate-400 relative z-10 transition-transform duration-300" />}
              </button>

              {openAccordions.services && (
                <div className="pl-12 flex flex-col gap-2.5 mt-2 text-sm sidebar-accordion-content" style={{ maxHeight: '120px', opacity: 1 }}>
                  <span
                    onClick={() => setActiveTab('services')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'services' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    All Services
                  </span>
                </div>
              )}
            </div>

            {/* Opportunity Management Dropdown Accordion */}
            <div>
              <button
                onClick={() => toggleAccordion('opportunityMgt')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 w-full text-left cursor-pointer relative z-10 ${
                  activeTab === 'opportunities' || activeTab === 'applicants'
                    ? 'bg-[#72bf24] text-white shadow-md shadow-[#72bf24]/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 nav-item-icon" />
                  <span>Opportunity Mgt</span>
                </div>
                {openAccordions.opportunityMgt ? <ChevronUp className="w-5 h-5 relative z-10 transition-transform duration-300" /> : <ChevronDown className="w-5 h-5 text-slate-400 relative z-10 transition-transform duration-300" />}
              </button>

              {openAccordions.opportunityMgt && (
                <div className="pl-12 flex flex-col gap-2.5 mt-2 text-sm sidebar-accordion-content" style={{ maxHeight: '120px', opacity: 1 }}>
                  <span
                    onClick={() => setActiveTab('opportunities')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'opportunities' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Opportunities
                  </span>
                  <span
                    onClick={() => setActiveTab('applicants')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'applicants' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Applicants
                  </span>
                </div>
              )}
            </div>

            {/* Partner Management Dropdown Accordion */}
            <div>
              <button
                onClick={() => {
                  toggleAccordion('partner');
                  setActiveTab('partner-list');
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 w-full text-left cursor-pointer relative z-10 ${
                  activeTab === 'partner-list' ? 'bg-[#72bf24] text-white shadow-md shadow-[#72bf24]/20' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 nav-item-icon" />
                  <span>Partner Management</span>
                </div>
                {openAccordions.partner ? <ChevronUp className="w-5 h-5 relative z-10 transition-transform duration-300" /> : <ChevronDown className="w-5 h-5 text-slate-400 relative z-10 transition-transform duration-300" />}
              </button>

              {openAccordions.partner && (
                <div className="pl-12 flex flex-col gap-2.5 mt-2 text-sm sidebar-accordion-content" style={{ maxHeight: '120px', opacity: 1 }}>
                  <span
                    onClick={() => setActiveTab('partner-list')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'partner-list' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Partner List
                  </span>
                </div>
              )}
            </div>

            {/* Mailbox */}
            <button
              onClick={() => setActiveTab('mailbox')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 w-full text-left cursor-pointer relative z-10 ${
                activeTab === 'mailbox' ? 'bg-[#72bf24] text-white shadow-md shadow-[#72bf24]/20' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 nav-item-icon" />
                <span>Mailbox</span>
              </div>
              <span className="bg-[#eaf6de] text-[#5b9b1d] text-xs px-2.5 py-1 rounded-full font-bold transition-all duration-300 hover:scale-105">
                {emails.filter(e => !e.read).length}
              </span>
            </button>

            {/* Company News */}
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left cursor-pointer relative z-10 ${
                activeTab === 'news' ? 'bg-[#72bf24] text-white shadow-md shadow-[#72bf24]/20' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
              }`}
            >
              <Newspaper className="w-4 h-4 relative z-10 nav-item-icon" />
              <span>Company News</span>
            </button>

            {/* Journey / Milestones */}
            <button
              onClick={() => setActiveTab('journey')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left cursor-pointer relative z-10 ${
                activeTab === 'journey' ? 'bg-[#72bf24] text-white shadow-md shadow-[#72bf24]/20' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
              }`}
            >
              <Activity className="w-4 h-4 relative z-10 nav-item-icon" />
              <span>Journey</span>
            </button>

            {/* Corporate Mgt Dropdown Accordion with Board of Advisors */}
            <div>
              <button
                onClick={() => toggleAccordion('corporateMgt')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 w-full text-left cursor-pointer relative z-10 ${
                  activeTab === 'board-of-advisors' 
                    ? 'bg-[#72bf24] text-white shadow-md shadow-[#72bf24]/20' 
                    : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 relative z-10 nav-item-icon" />
                  <span>Corporate Mgt</span>
                </div>
                {openAccordions.corporateMgt ? <ChevronUp className="w-5 h-5 relative z-10 transition-transform duration-300" /> : <ChevronDown className="w-5 h-5 text-slate-400 relative z-10 transition-transform duration-300" />}
              </button>

              {openAccordions.corporateMgt && (
                <div className="pl-12 flex flex-col gap-2.5 mt-2 text-sm sidebar-accordion-content" style={{ maxHeight: '120px', opacity: 1 }}>
                  <span
                    onClick={() => setActiveTab('board-of-advisors')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'board-of-advisors' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Board of Advisors
                  </span>
                  <span
                    onClick={() => setActiveTab('management-team')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'management-team' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Management Team
                  </span>
                </div>
              )}
            </div>

            {/* Legal & Compliance Dropdown Accordion */}
            <div>
              <button
                onClick={() => toggleAccordion('legalMgt')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 w-full text-left cursor-pointer relative z-10 ${
                  activeTab.startsWith('legal-') 
                    ? 'bg-[#72bf24] text-white shadow-md shadow-[#72bf24]/20' 
                    : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 relative z-10 nav-item-icon" />
                  <span>Legal & Compliance</span>
                </div>
                {openAccordions.legalMgt ? <ChevronUp className="w-5 h-5 relative z-10 transition-transform duration-300" /> : <ChevronDown className="w-5 h-5 text-slate-400 relative z-10 transition-transform duration-300" />}
              </button>

              {openAccordions.legalMgt && (
                <div className="pl-12 flex flex-col gap-2.5 mt-2 text-sm sidebar-accordion-content" style={{ maxHeight: '320px', opacity: 1 }}>
                  <span
                    onClick={() => setActiveTab('legal-service-agreement')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'legal-service-agreement' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Service Agreement
                  </span>
                  <span
                    onClick={() => setActiveTab('legal-agreement-history')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'legal-agreement-history' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Agreement History
                  </span>
                  <span
                    onClick={() => setActiveTab('legal-jurisdictions')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'legal-jurisdictions' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Jurisdictions
                  </span>
                  <span
                    onClick={() => setActiveTab('legal-contact-info')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'legal-contact-info' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Contact Information
                  </span>
                  <span
                    onClick={() => setActiveTab('legal-privacy-policy')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'legal-privacy-policy' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Privacy Policy
                  </span>
                </div>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Settings Dropdown Accordion */}
            <div>
              <button
                onClick={() => toggleAccordion('settings')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 w-full text-left cursor-pointer relative z-10 ${
                  activeTab === 'settings' || activeTab === 'manage-account'
                    ? 'bg-[#72bf24] text-white shadow-md shadow-[#72bf24]/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 relative z-10 nav-item-icon" />
                  <span>Settings</span>
                </div>
                {openAccordions.settings ? <ChevronUp className="w-5 h-5 relative z-10 transition-transform duration-300" /> : <ChevronDown className="w-5 h-5 text-slate-400 relative z-10 transition-transform duration-300" />}
              </button>

              {openAccordions.settings && (
                <div className="pl-12 flex flex-col gap-2.5 mt-2 text-sm sidebar-accordion-content" style={{ maxHeight: '120px', opacity: 1 }}>
                  <span
                    onClick={() => setActiveTab('settings')}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'settings' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    General Settings
                  </span>
                  <span
                    onClick={() => {
                      setActiveTab('manage-account');
                      fetchCurrentUser();
                    }}
                    className={`cursor-pointer transition-colors duration-300 ${
                      activeTab === 'manage-account' ? 'text-[#72bf24] font-bold' : 'text-slate-500 hover:text-[#72bf24]'
                    }`}
                  >
                    Manage Account
                  </span>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  logout();
                  navigate('/');
                }
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 mt-2 relative z-10"
            >
              <LogOut className="w-4 h-4 relative z-10 nav-item-icon" />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Layout Area */}
        <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
          <main className="p-12 flex-1 flex flex-col min-h-0">
            {/* Top Header Bar */}
            <header className="flex items-center justify-between mb-10">
              <div className="flex items-center bg-white rounded-2xl px-5 py-3 w-[28rem] gap-3 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 focus-within:shadow-md focus-within:border-[#72bf24]/50">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products, applicants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">Admin User</div>
                  <div className="text-[11px] font-bold text-[#72bf24] tracking-wider">SUPER ADMIN</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#e8f5e9] text-[#72bf24] font-semibold text-sm flex items-center justify-center border border-[#72bf24]/20 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md">
                  AD
                </div>
              </div>
            </header>

            {/* ==================== DASHBOARD ==================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">System Overview</h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time metrics and operational insights</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                      <Filter className="w-3.5 h-3.5 text-slate-500" /> Filter Range
                    </button>
                  </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" onClick={async () => {
                    console.log('Comments card clicked');
                    const data = await apiFetch('/comments/by-article').catch(() => []);
                    console.log('Comments data fetched:', data);
                    setViewStatsDetail({ type: 'comments', data });
                  }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Comments</span>
                        <h3 className="text-xl font-bold text-slate-900 mt-1 transition-all duration-700">
                          {stats.comments.toLocaleString()}
                        </h3>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center transition-all duration-300 hover:scale-110">
                        <MessageCircle className="w-4 h-4 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-amber-600">
                      <span>View by article</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" onClick={async () => {
                    const data = await apiFetch('/news').catch(() => []);
                    setViewStatsDetail({ type: 'views', data });
                  }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Views</span>
                        <h3 className="text-xl font-bold text-slate-900 mt-1 transition-all duration-700">
                          {stats.views.toLocaleString()}
                        </h3>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center transition-all duration-300 hover:scale-110">
                        <Eye className="w-4 h-4 text-rose-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-rose-600">
                      <span>View per post</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" onClick={async () => {
                    const data = await apiFetch('/subscribers').catch(() => []);
                    setViewStatsDetail({ type: 'subscribers', data });
                  }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Subscribers</span>
                        <h3 className="text-xl font-bold text-slate-900 mt-1 transition-all duration-700">
                          {stats.subscribers.toLocaleString()}
                        </h3>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center transition-all duration-300 hover:scale-110">
                        <Mail className="w-4 h-4 text-teal-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-teal-600">
                      <span>View all emails</span>
                    </div>
                  </div>
                </div>

                {/* Mailbox Status with Pie Chart & Applicants per Opportunity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Mailbox Status</h3>
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-44 h-44">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                          {mailboxData.map((item, index) => {
                            const percentage = item.value / totalMailbox;
                            const startAngle = mailboxData.slice(0, index).reduce((acc, curr) => acc + (curr.value / totalMailbox) * 360, 0);
                            const endAngle = startAngle + percentage * 360;
                            
                            const startRad = (startAngle - 90) * Math.PI / 180;
                            const endRad = (endAngle - 90) * Math.PI / 180;
                            const radius = 50;
                            const cx = 60;
                            const cy = 60;
                            
                            const x1 = cx + radius * Math.cos(startRad);
                            const y1 = cy + radius * Math.sin(startRad);
                            const x2 = cx + radius * Math.cos(endRad);
                            const y2 = cy + radius * Math.sin(endRad);
                            const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                            
                            return (
                              <path
                                key={index}
                                d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={item.color}
                                stroke="white"
                                strokeWidth="2"
                                className="transition-all duration-1000"
                                style={{
                                  transform: `scale(${animateCharts ? 1 : 0.7})`,
                                  opacity: animateCharts ? 1 : 0,
                                  transformOrigin: `${cx}px ${cy}px`,
                                  transitionDelay: `${index * 150}ms`
                                }}
                              />
                            );
                          })}
                          <circle cx="60" cy="60" r="28" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                          <text x="60" y="57" textAnchor="middle" className="text-xs font-bold fill-slate-700">Total</text>
                          <text x="60" y="70" textAnchor="middle" className="text-[10px] font-bold fill-[#72bf24]">
                            {totalMailbox.toLocaleString()}
                          </text>
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {mailboxData.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm text-slate-600">{item.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                      <button className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all duration-300">Read</button>
                      <button className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-300">Replied</button>
                      <button className="px-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-all duration-300">Unread</button>
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Opportunities Overview</h3>
                    <div className="space-y-4">
                      {jobOpportunities.length > 0 ? (
                        jobOpportunities.map((job) => {
                          const maxApps = Math.max(...jobOpportunities.map(j => j.applications || 0), 1);
                          const percentage = ((job.applications || 0) / maxApps) * 100;
                          return (
                            <div key={job.id}>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm text-slate-600">{job.title}</span>
                                <span className="text-sm font-semibold text-slate-900">{job.applications || 0}</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-[#72bf24] h-2.5 rounded-full transition-all duration-1000"
                                  style={{
                                    width: animateCharts ? percentage + '%' : '0%',
                                    transitionDelay: '200ms'
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-sm text-slate-400">
                          No opportunities data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Weekly Mail & Communication Activity</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Inbound vs Outbound emails across partners</p>
                    </div>
                    <div className="flex justify-end gap-6 text-xs font-medium">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#72bf24]"></span> Received
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span> Sent
                      </span>
                    </div>
                  </div>
                  <div className="h-64 flex items-end justify-between border-b border-slate-100 pb-3 px-2">
                    {weeklyData.map((item, idx) => {
                      const receivedHeight = (item.received / maxValue) * 200;
                      const sentHeight = (item.sent / maxValue) * 200;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 w-full">
                          <div className="flex gap-1.5 items-end">
                            <div 
                              className="w-6 bg-[#72bf24] rounded-t transition-all duration-1000 hover:opacity-80"
                              style={{ 
                                height: animateCharts ? `${receivedHeight}px` : '0px',
                                transitionDelay: `${idx * 100}ms`
                              }}
                            ></div>
                            <div 
                              className="w-6 bg-blue-500 rounded-t transition-all duration-1000 hover:opacity-80"
                              style={{ 
                                height: animateCharts ? `${sentHeight}px` : '0px',
                                transitionDelay: `${idx * 100 + 50}ms`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-400 font-medium mt-2">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== PRODUCTS VIEW ==================== */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Product Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage <span className="text-[#72bf24]">SATESOFT</span> software solutions</p>
                  </div>
                  <button
                    onClick={handleOpenAddProduct}
                    className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc]">
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider">
                        <th className="py-4 pl-6 w-[30%]">PRODUCT</th>
                        <th className="py-4 w-[55%]">TAGLINE</th>
                        <th className="py-4 pr-6 text-right w-[15%]">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-50/70 transition-colors duration-150 group">
                            <td className="py-5 pl-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#f0f9e8] border border-[#d3f0b4] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110">
                                  {renderProductIcon(product.iconType)}
                                </div>
                                <button
                                  onClick={() => setViewProduct(product)}
                                  className="font-bold text-slate-900 text-base text-left hover:text-[#72bf24] transition-colors duration-300 cursor-pointer"
                                  title="View product details"
                                >
                                  {product.name}
                                </button>
                              </div>
                            </td>
                            <td className="py-5 text-sm text-slate-600">
                              {product.tagline}
                            </td>
                            <td className="py-5 pr-6">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewProduct(product)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-blue-600"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditProduct(product)}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-[#72bf24]"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-300 text-slate-400 hover:text-slate-600"
                                  title="More"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <Box className="w-12 h-12 text-slate-300" />
                              <span className="text-sm text-slate-400">No products found matching your search.</span>
                              <button
                                onClick={handleOpenAddProduct}
                                className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                              >
                                Add your first product
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== SERVICES VIEW ==================== */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Service Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage <span className="text-[#72bf24]">SATESOFT</span> service offerings</p>
                  </div>
                  <button
                    onClick={handleOpenAddService}
                    className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Service</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc]">
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider">
                        <th className="py-4 pl-6 w-[40%]">SERVICE</th>
                        <th className="py-4 w-[35%]">SUBTITLE</th>
                        <th className="py-4 pr-6 text-right w-[25%]">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {services.length > 0 ? (
                        services.map((service) => (
                          <tr key={service.id} className="hover:bg-slate-50/70 transition-colors duration-150 group">
                            <td className="py-5 pl-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#f0f9e8] border border-[#d3f0b4] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110">
                                  <Box className="w-5 h-5 text-[#72bf24]" />
                                </div>
                                <button
                                  onClick={() => handleViewService(service)}
                                  className="font-bold text-slate-900 text-base text-left hover:text-[#72bf24] transition-colors duration-300 cursor-pointer"
                                  title="View service details"
                                >
                                  {service.title}
                                </button>
                              </div>
                            </td>
                            <td className="py-5 text-sm text-slate-600">
                              {service.subtitle || '-'}
                            </td>
                            <td className="py-5 pr-6">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewService(service)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-blue-600"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditService(service)}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-[#72bf24]"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteService(service.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-300 text-slate-400 hover:text-slate-600"
                                  title="More"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <Box className="w-12 h-12 text-slate-300" />
                              <span className="text-sm text-slate-400">No services found matching your search.</span>
                              <button
                                onClick={handleOpenAddService}
                                className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                              >
                                Add your first service
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== OPPORTUNITIES VIEW ==================== */}
            {activeTab === 'opportunities' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Opportunities</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage job openings and career opportunities</p>
                  </div>
                  <button
                    onClick={handleOpenAddOpportunity}
                    className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Opportunity</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc]">
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider">
                        <th className="py-4 pl-6 w-[30%]">TITLE</th>
                        <th className="py-4 w-[20%]">LOCATION</th>
                        <th className="py-4 w-[15%]">TYPE</th>
                        <th className="py-4 w-[15%]">APPLICATIONS</th>
                        <th className="py-4 pr-6 text-right w-[20%]">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredJobOpportunities.length > 0 ? (
                        filteredJobOpportunities.map((job) => (
                          <tr key={job.id} className="hover:bg-slate-50/70 transition-colors duration-150 group">
                            <td className="py-5 pl-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#f0f9e8] border border-[#d3f0b4] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110">
                                  <BriefcaseIcon className="w-5 h-5 text-[#72bf24]" />
                                </div>
                                <button
                                  onClick={() => handleViewOpportunity(job)}
                                  className="font-bold text-slate-900 text-base text-left hover:text-[#72bf24] transition-colors duration-300 cursor-pointer"
                                  title="View opportunity details"
                                >
                                  {job.title}
                                </button>
                              </div>
                            </td>
                            <td className="py-5 text-sm text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {job.location}
                              </div>
                            </td>
                            <td className="py-5 text-sm text-slate-600">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {job.type}
                              </span>
                            </td>
                            <td className="py-5 text-sm font-semibold text-slate-900">
                              {job.applications || 0}
                            </td>
                            <td className="py-5 pr-6">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewOpportunity(job)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-blue-600"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditOpportunity(job)}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-[#72bf24]"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOpportunity(job.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <BriefcaseIcon className="w-12 h-12 text-slate-300" />
                              <span className="text-sm text-slate-400">No opportunities found matching your search.</span>
                              <button
                                onClick={handleOpenAddOpportunity}
                                className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                              >
                                Add your first opportunity
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== APPLICANTS VIEW ==================== */}
            {activeTab === 'applicants' && (
              <div className="space-y-6">
                   <div className="flex items-center justify-between">
                   <div>
                     <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Applicants</h1>
                     <p className="text-sm text-slate-500 mt-1">Review and manage job applications</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <button
                       onClick={fetchApplicants}
                       className="p-2 text-slate-600 hover:text-[#72bf24] hover:bg-[#72bf24]/10 rounded-xl transition-colors"
                       title="Refresh applicants"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5m0-5l7 7 7-7v5H4z"></path></svg>
                     </button>
                     <button
                       onClick={handleOpenAddApplicant}
                       className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                     >
                       <Plus className="w-4 h-4 stroke-[2.5]" />
                       <span>Add Applicant</span>
                     </button>
                   </div>
                 </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {(() => {
                    const stats = getApplicantStats();
                    return (
                      <>
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</div>
                          <div className="text-xl font-bold text-slate-900 mt-1">{stats.total}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</div>
                          <div className="text-xl font-bold text-amber-700 mt-1">{stats.pending}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Reviewed</div>
                          <div className="text-xl font-bold text-blue-700 mt-1">{stats.reviewed}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Accepted</div>
                          <div className="text-xl font-bold text-emerald-700 mt-1">{stats.accepted}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                          <div className="text-xs font-semibold text-red-600 uppercase tracking-wider">Rejected</div>
                          <div className="text-xl font-bold text-red-700 mt-1">{stats.rejected}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity</label>
                      <select
                        value={applicantFilter.opportunity}
                        onChange={(e) => setApplicantFilter({ ...applicantFilter, opportunity: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                      >
                        <option value="all">All Opportunities</option>
                        {getUniqueOpportunities().map(opp => (
                          <option key={opp} value={opp}>{opp}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Sex</label>
                      <select
                        value={applicantFilter.sex}
                        onChange={(e) => setApplicantFilter({ ...applicantFilter, sex: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24]"
                      >
                        <option value="all">All Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
                      <select
                        value={applicantFilter.experience}
                        onChange={(e) => setApplicantFilter({ ...applicantFilter, experience: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24]"
                      >
                        <option value="all">All Experience</option>
                        {getUniqueExperiences().map(exp => (
                          <option key={exp} value={exp}>{exp}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                      <select
                        value={applicantFilter.status}
                        onChange={(e) => setApplicantFilter({ ...applicantFilter, status: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24]"
                      >
                        <option value="all">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="ACCEPTED">Accepted</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Applicants Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc]">
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider">
                        <th className="py-4 pl-6">APPLICANT</th>
                        <th className="py-4">OPPORTUNITY</th>
                        <th className="py-4">CONTACT</th>
                        <th className="py-4">EXPERIENCE</th>
                        <th className="py-4">APPLIED</th>
                        <th className="py-4">STATUS</th>
                        <th className="py-4 pr-6 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApplicants.length > 0 ? (
                        filteredApplicants.map((applicant) => (
                          <tr key={applicant.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                            <td className="py-5 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#f0f9e8] border border-[#d3f0b4] flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-110">
                                  <span className="text-xs font-bold text-[#72bf24]">
                                    {applicant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 text-sm">{applicant.name}</div>
                                  <div className="text-xs text-slate-400">{applicant.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 text-sm text-slate-600">{applicant.opportunity || 'N/A'}</td>
                            <td className="py-5">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm text-slate-600">{applicant.email || 'No email'}</span>
                                {applicant.phone && (
                                  <span className="text-xs text-slate-400">{applicant.phone}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-5 text-sm text-slate-600">{applicant.experience || 'N/A'}</td>
                             <td className="py-5 text-sm text-slate-600">{applicant.appliedDate}</td>
                             <td className="py-5 pr-2">
                               <select
                                value={applicant.status}
                                onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                                className="text-xs font-bold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer bg-blue-50 text-blue-700 transition-all duration-300 hover:bg-blue-100"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="REVIEWED">REVIEWED</option>
                                <option value="ACCEPTED">ACCEPTED</option>
                                <option value="REJECTED">REJECTED</option>
                              </select>
                            </td>
                            <td className="py-5 pr-6">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewApplicant(applicant)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-blue-600"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditApplicant(applicant)}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-[#72bf24]"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteApplicant(applicant.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <UsersIcon className="w-12 h-12 text-slate-300" />
                              <span className="text-sm text-slate-400">No applicants found matching your filters.</span>
                              <button
                                onClick={handleOpenAddApplicant}
                                className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                              >
                                Add your first applicant
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== PARTNER MANAGEMENT VIEW ==================== */}
            {activeTab === 'partner-list' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Partner List</h1>
                    <p className="text-sm text-slate-500 mt-1 font-normal">Manage your business partners and collaborations</p>
                  </div>
                  <button
                    onClick={handleOpenAddPartner}
                    className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Partner</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 tracking-wider">
                        <th className="pb-4 pl-2">PARTNER</th>
                        <th className="pb-4">INDUSTRY</th>
                        <th className="pb-4">LOCATION</th>
                        <th className="pb-4">CONTACT</th>
                        <th className="pb-4">STATUS</th>
                        <th className="pb-4 text-right pr-2">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPartners.length > 0 ? (
                        filteredPartners.map((partner) => (
                          <tr key={partner.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                            <td className="py-5 pl-2">
                              <div>
                                <div className="font-semibold text-slate-900 text-base">{partner.name}</div>
                                <div className="text-xs text-slate-400 mt-0.5">Joined: {partner.joined}</div>
                              </div>
                            </td>
                            <td className="py-5 text-sm text-slate-600">{partner.industry}</td>
                            <td className="py-5 text-sm text-slate-600">{partner.location}</td>
                            <td className="py-5">
                              <div>
                                <div className="text-sm font-medium text-slate-800">{partner.contactName}</div>
                                <div className="text-xs text-slate-400">{partner.contactEmail}</div>
                              </div>
                            </td>
                            <td className="py-5">
                              <span className="bg-[#dcfce7] text-[#166534] text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide transition-all duration-300 hover:scale-105">
                                {partner.status}
                              </span>
                            </td>
                            <td className="py-5 pr-2">
                              <div className="flex items-center justify-end gap-3 text-slate-400">
                                <button
                                  onClick={() => setViewPartner(partner)}
                                  className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 cursor-pointer"
                                  title="View Partner"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditPartner(partner)}
                                  className="p-1.5 hover:text-[#72bf24] hover:bg-green-50 rounded-lg transition-all duration-300 cursor-pointer"
                                  title="Edit Partner"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleTerminatePartner(partner.id)}
                                  className={"text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 " + (partner.status === 'ACTIVE' ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100")}
                                >
                                  {partner.status === 'ACTIVE' ? 'Active' : 'Terminated'}
                                </button>
                                <button
                                  onClick={() => handleDeletePartner(partner.id)}
                                  className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 cursor-pointer"
                                  title="Delete Partner"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                            No partners found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== BOARD OF ADVISORS VIEW ==================== */}
            {activeTab === 'board-of-advisors' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Board of Advisors</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage profiles and information for the <span className="text-[#72bf24]">SATESOFT</span> Board of Advisors</p>
                  </div>
                  <button
                    onClick={handleOpenAddAdvisor}
                    className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Advisor</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc]">
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider">
                        <th className="py-4 pl-6 w-[40%]">NAME</th>
                        <th className="py-4 w-[40%]">ROLE</th>
                        <th className="py-4 pr-6 text-right w-[20%]">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAdvisors.length > 0 ? (
                        filteredAdvisors.map((advisor) => (
                          <tr key={advisor.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                            <td className="py-5 pl-6">
                              <div className="font-semibold text-slate-900 text-sm">{advisor.name}</div>
                            </td>
                            <td className="py-5 text-sm text-slate-600">{advisor.role}</td>
                            <td className="py-5 pr-6">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewAdvisor(advisor)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-blue-600"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditAdvisor(advisor)}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-[#72bf24]"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAdvisor(advisor.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <User className="w-12 h-12 text-slate-300" />
                              <span className="text-sm text-slate-400">No advisors found matching your search.</span>
                              <button
                                onClick={handleOpenAddAdvisor}
                                className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                              >
                                Add your first advisor
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== MANAGEMENT TEAM VIEW ==================== */}
            {activeTab === 'management-team' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Management Team</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage profiles and information for the <span className="text-[#72bf24]">SATESOFT</span> Management Team</p>
                  </div>
                  <button
                    onClick={handleOpenAddAdvisor}
                    className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Member</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc]">
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider">
                        <th className="py-4 pl-6 w-[40%]">NAME</th>
                        <th className="py-4 w-[40%]">ROLE</th>
                        <th className="py-4 pr-6 text-right w-[20%]">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredManagementTeam.length > 0 ? (
                        filteredManagementTeam.map((advisor) => (
                          <tr key={advisor.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                            <td className="py-5 pl-6">
                              <div className="font-semibold text-slate-900 text-sm">{advisor.name}</div>
                            </td>
                            <td className="py-5 text-sm text-slate-600">{advisor.role}</td>
                            <td className="py-5 pr-6">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewAdvisor(advisor)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-blue-600"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditAdvisor(advisor)}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-[#72bf24]"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAdvisor(advisor.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <User className="w-12 h-12 text-slate-300" />
                              <span className="text-sm text-slate-400">No management team members found matching your search.</span>
                              <button
                                onClick={handleOpenAddAdvisor}
                                className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                              >
                                Add your first management team member
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== VIEW ADVISOR MODAL ==================== */}
            {viewAdvisor && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-slate-900">Advisor Details</h3>
                    <button onClick={() => setViewAdvisor(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</label>
                      <div className="text-sm font-semibold text-slate-900 mt-1">{viewAdvisor.name}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
                      <div className="text-sm text-slate-700 mt-1">{viewAdvisor.role}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</label>
                      <div className="text-sm text-slate-700 mt-1 leading-relaxed">{viewAdvisor.message || 'No message provided.'}</div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => { setViewAdvisor(null); handleOpenEditAdvisor(viewAdvisor); }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Advisor
                    </button>
                    <button
                      onClick={() => setViewAdvisor(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

             {/* ==================== ADVISOR MODAL ==================== */}
             {isAdvisorModalOpen && (
               <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
                   <div className="flex items-center justify-between mb-5">
                     <h3 className="text-base font-semibold text-slate-900">
                       {advisorModalMode === 'add' ? 'Add New Advisor' : 'Edit Advisor'}
                     </h3>
                     <button 
                       onClick={() => setIsAdvisorModalOpen(false)} 
                       className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90"
                     >
                       <X className="w-5 h-5" />
                     </button>
                   </div>

                  {advisorError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl animate-shake">
                      {advisorError}
                    </div>
                  )}

                      <form onSubmit={handleSaveAdvisor} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                            <input
                              type="text"
                              required
                              value={advisorFormData.name}
                              onChange={(e) => setAdvisorFormData({ ...advisorFormData, name: e.target.value })}
                              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                              placeholder="e.g. Samuel Otieno"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                            <input
                              type="text"
                              required
                              value={advisorFormData.role}
                              onChange={(e) => setAdvisorFormData({ ...advisorFormData, role: e.target.value })}
                              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                              placeholder="e.g. Board Member, Advisor"
                            />
                          </div>
                        </div>

                       <div>
                         <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                         <textarea
                           rows="4"
                           value={advisorFormData.message}
                           onChange={(e) => setAdvisorFormData({ ...advisorFormData, message: e.target.value })}
                           className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                           placeholder="Message from the advisor..."
                         />
                       </div>

                  <div className="flex justify-end gap-3 pt-4 shrink-0">
                       <button
                         type="button"
                         onClick={() => setIsAdvisorModalOpen(false)}
                         className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                       >
                         Cancel
                       </button>
                       <button 
                         type="submit" 
                         disabled={advisorSaving} 
                         className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all duration-300 ${
                           advisorSaving 
                             ? "bg-slate-400 cursor-not-allowed" 
                             : "bg-[#72bf24] hover:bg-[#62a71e] hover:shadow-md hover:-translate-y-0.5"
                         }`}
                       >
                         <span>{advisorSaving ? 'Saving...' : (advisorModalMode === 'add' ? 'Add Advisor' : 'Update Advisor')}</span>
                       </button>
                     </div>
                   </form>
                </div>
              </div>
            )}

             {/* ==================== SERVICE AGREEMENT MODAL ==================== */}
             {isAgreementModalOpen && (
               <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
                   <div className="flex items-center justify-between mb-5">
                     <h3 className="text-base font-semibold text-slate-900">
                       {agreementModalMode === 'add' ? 'Add New Agreement Section' : 'Edit Agreement Section'}
                     </h3>
                     <button 
                       onClick={() => { setIsAgreementModalOpen(false); setGrammarResult(''); }} 
                       className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90"
                     >
                       <X className="w-5 h-5" />
                     </button>
                   </div>

                    <form onSubmit={handleSaveAgreement} className="space-y-4">
                      <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Section Title</label>
                       <input
                         type="text"
                         required
                         value={agreementFormData.title}
                         onChange={(e) => setAgreementFormData({ ...agreementFormData, title: e.target.value })}
                         className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                         placeholder="e.g. 4. Using the Services"
                       />
                     </div>

                     <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Content</label>
                       <textarea
                         rows="8"
                         value={agreementFormData.content}
                         onChange={(e) => setAgreementFormData({ ...agreementFormData, content: e.target.value })}
                         className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                         placeholder="Enter agreement content here..."
                       />
                     </div>

                     <div className="flex justify-end gap-3 pt-4">
                       <button
                         type="button"
                         onClick={() => { setIsAgreementModalOpen(false); setGrammarResult(''); }}
                         className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                       >
                         Cancel
                       </button>
                        <button 
                          type="submit" 
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                        >
                          <span>{agreementModalMode === 'add' ? 'Add Section' : 'Update Section'}</span>
                       </button>
                     </div>
                   </form>
                 </div>
               </div>
             )}

            {/* ==================== VIEW AGREEMENT MODAL ==================== */}
            {viewAgreement && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-100 flex flex-col max-h-[90vh] transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-5 shrink-0">
                    <h3 className="text-base font-semibold text-slate-900">{viewAgreement.title}</h3>
                    <button onClick={() => setViewAgreement(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="text-sm text-slate-700 leading-relaxed transition-all duration-300" dangerouslySetInnerHTML={{ __html: renderMarkdown(viewAgreement.content || 'No content available.') }}></div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100 shrink-0">
                    <button
                      onClick={() => { setViewAgreement(null); handleOpenEditAgreement(viewAgreement); }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Agreement
                    </button>
                    <button
                      onClick={() => setViewAgreement(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

             {/* ==================== PRIVACY POLICY MODAL ==================== */}
             {isPrivacyPolicyModalOpen && (
               <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
                   <div className="flex items-center justify-between mb-5">
                     <h3 className="text-base font-semibold text-slate-900">
                       {privacyPolicyModalMode === 'add' ? 'Add New Privacy Policy' : 'Edit Privacy Policy'}
                     </h3>
                     <button 
                       onClick={() => setIsPrivacyPolicyModalOpen(false)} 
                       className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90"
                     >
                       <X className="w-5 h-5" />
                     </button>
                   </div>

                    <form onSubmit={handleSavePrivacyPolicy} className="space-y-4">
                      <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                       <input
                         type="text"
                         required
                         value={privacyPolicyFormData.title}
                         onChange={(e) => setPrivacyPolicyFormData({ ...privacyPolicyFormData, title: e.target.value })}
                         className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                         placeholder="e.g. Privacy Policy"
                       />
                     </div>

                     <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Content</label>
                       <textarea
                         rows="8"
                         value={privacyPolicyFormData.content}
                         onChange={(e) => setPrivacyPolicyFormData({ ...privacyPolicyFormData, content: e.target.value })}
                         className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                         placeholder="Enter privacy policy content here..."
                       />
                     </div>

                     <div className="flex justify-end gap-3 pt-4">
                       <button
                         type="button"
                         onClick={() => setIsPrivacyPolicyModalOpen(false)}
                         className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                       >
                         Cancel
                       </button>
                        <button 
                          type="submit" 
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                        >
                          <span>{privacyPolicyModalMode === 'add' ? 'Add Policy' : 'Update Policy'}</span>
                       </button>
                     </div>
                   </form>
                 </div>
               </div>
             )}

             {/* ==================== VIEW PRIVACY POLICY MODAL ==================== */}
             {viewPrivacyPolicy && (
               <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
                   <div className="flex items-center justify-between mb-5">
                     <h3 className="text-base font-semibold text-slate-900">{viewPrivacyPolicy.title}</h3>
                     <button onClick={() => setViewPrivacyPolicy(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                       <X className="w-5 h-5" />
                     </button>
                   </div>

                   <div className="space-y-4 overflow-y-auto pr-2 max-h-[60vh]">
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
                       <div className="text-sm font-semibold text-slate-900 mt-1">{viewPrivacyPolicy.title}</div>
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Content</label>
                       <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{viewPrivacyPolicy.content || 'No content available.'}</div>
                     </div>
                   </div>

                   <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100 shrink-0">
                     <button
                       onClick={() => { setViewPrivacyPolicy(null); handleOpenEditPrivacyPolicy(viewPrivacyPolicy); }}
                       className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                     >
                       <Pencil className="w-3.5 h-3.5" />
                       Edit Policy
                     </button>
                     <button
                       onClick={() => setViewPrivacyPolicy(null)}
                       className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                     >
                       Close
                     </button>
                   </div>
                 </div>
               </div>
             )}

             {/* ==================== JURISDICTION MODAL ==================== */}
             {isJurisdictionModalOpen && (
               <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
                   <div className="flex items-center justify-between mb-5">
                     <h3 className="text-base font-semibold text-slate-900">
                       {jurisdictionModalMode === 'add' ? 'Add New Jurisdiction' : 'Edit Jurisdiction'}
                     </h3>
                     <button 
                       onClick={() => setIsJurisdictionModalOpen(false)} 
                       className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90"
                     >
                       <X className="w-5 h-5" />
                     </button>
                   </div>

                   <form onSubmit={handleSaveJurisdiction} className="space-y-4">
                     <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                       <input
                         type="text"
                         required
                         value={jurisdictionFormData.country}
                         onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, country: e.target.value })}
                         className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                         placeholder="e.g. Kenya"
                       />
                     </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Entity</label>
                        <input
                          type="text"
                          value={jurisdictionFormData.lead_entity}
                          onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, lead_entity: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                          placeholder="e.g. SATESOFT Kenya Ltd"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Entity Type</label>
                        <input
                          type="text"
                          value={jurisdictionFormData.entity_type}
                          onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, entity_type: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                          placeholder="e.g. Subsidiary, Branch"
                        />
                      </div>

                     <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Law</label>
                       <input
                         type="text"
                         value={jurisdictionFormData.primary_law}
                         onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, primary_law: e.target.value })}
                         className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                         placeholder="e.g. Companies Act, 2015"
                       />
                     </div>

                     <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Laws</label>
                       <textarea
                         rows="3"
                         value={jurisdictionFormData.additional_laws}
                         onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, additional_laws: e.target.value })}
                         className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                         placeholder="e.g. Data Protection Act, 2019"
                       />
                     </div>

                     <div className="flex justify-end gap-3 pt-4">
                       <button
                         type="button"
                         onClick={() => setIsJurisdictionModalOpen(false)}
                         className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                       >
                         Cancel
                       </button>
                       <button 
                         type="submit" 
                         className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                       >
                         <span>{jurisdictionModalMode === 'add' ? 'Add Jurisdiction' : 'Update Jurisdiction'}</span>
                       </button>
                     </div>
                   </form>
                 </div>
               </div>
             )}

            {/* ==================== VIEW JURISDICTION MODAL ==================== */}
            {viewJurisdiction && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-slate-900">Jurisdiction Details</h3>
                    <button onClick={() => setViewJurisdiction(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</label>
                      <div className="text-sm font-semibold text-slate-900 mt-1">{viewJurisdiction.country}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead Entity</label>
                        <div className="text-sm text-slate-700 mt-1">{viewJurisdiction.lead_entity || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity Type</label>
                        <div className="text-sm text-slate-700 mt-1">{viewJurisdiction.entity_type || '-'}</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Law</label>
                      <div className="text-sm text-slate-700 mt-1">{viewJurisdiction.primary_law || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Additional Laws</label>
                      <div className="text-sm text-slate-700 mt-1 leading-relaxed">{viewJurisdiction.additional_laws || '-'}</div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => { setViewJurisdiction(null); handleOpenEditJurisdiction(viewJurisdiction); }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Jurisdiction
                    </button>
                    <button
                      onClick={() => setViewJurisdiction(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== CONTACT MODAL ==================== */}
            {isContactModalOpen && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {contactModalMode === 'add' ? 'Add New Contact' : 'Edit Contact'}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {contactModalMode === 'add' ? 'Create a new contact entry' : 'Update contact information'}
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsContactModalOpen(false)} 
                      className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-all duration-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveContact} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Placeholder ID</label>
                        <input
                          type="text"
                          value={contactFormData.placeholder_id}
                          onChange={(e) => setContactFormData({ ...contactFormData, placeholder_id: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-2 focus:ring-[#72bf24]/20 transition-all"
                          placeholder="e.g. LC1, LC2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Contact Point</label>
                        <input
                          type="text"
                          required
                          value={contactFormData.contact_point}
                          onChange={(e) => setContactFormData({ ...contactFormData, contact_point: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-2 focus:ring-[#72bf24]/20 transition-all"
                          placeholder="e.g. email, phone, handle"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Section</label>
                        <input
                          type="text"
                          value={contactFormData.section}
                          onChange={(e) => setContactFormData({ ...contactFormData, section: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-2 focus:ring-[#72bf24]/20 transition-all"
                          placeholder="e.g. Legal, Support"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Category</label>
                        <select
                          value={contactFormData.category}
                          onChange={(e) => setContactFormData({ ...contactFormData, category: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-2 focus:ring-[#72bf24]/20 transition-all bg-white"
                        >
                          <option value="general">General Contact Directory</option>
                          <option value="legal">Legal Contact Directory</option>
                          <option value="social_media">Social Media Handlers</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Purpose / Context</label>
                      <textarea
                        rows="3"
                        value={contactFormData.purpose_context}
                        onChange={(e) => setContactFormData({ ...contactFormData, purpose_context: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-2 focus:ring-[#72bf24]/20 transition-all resize-none"
                        placeholder="Describe the purpose or context for this contact..."
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsContactModalOpen(false)}
                        className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        <span>{contactModalMode === 'add' ? 'Add Contact' : 'Update Contact'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ==================== VIEW CONTACT MODAL ==================== */}
            {viewContact && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-slate-900">Contact Details</h3>
                    <button onClick={() => setViewContact(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Placeholder ID</label>
                        <div className="text-sm font-semibold text-slate-900 mt-1">{viewContact.placeholder_id || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Point</label>
                        <div className="text-sm font-semibold text-slate-900 mt-1">{viewContact.contact_point}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Section</label>
                        <div className="text-sm text-slate-700 mt-1">{viewContact.section || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                        <div className="text-sm text-slate-700 mt-1 capitalize">{viewContact.category.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Purpose / Context</label>
                      <div className="text-sm text-slate-700 mt-1 leading-relaxed">{viewContact.purpose_context || '-'}</div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => { setViewContact(null); handleOpenEditContact(viewContact); }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Contact
                    </button>
                    <button
                      onClick={() => setViewContact(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== MAILBOX VIEW ==================== */}
            {activeTab === 'mailbox' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Mailbox</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your communications</p>
                  </div>
                  <button className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Compose</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  <div className="col-span-1 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-2 py-1.5 bg-[#f0f9e8] rounded-lg text-[#72bf24] font-semibold text-sm">
                        <Inbox className="w-4 h-4" />
                        <span>Inbox</span>
                        <span className="ml-auto bg-[#72bf24] text-white text-xs px-2 py-0.5 rounded-full">
                          {emails.filter(e => !e.read).length}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-300 text-sm">
                          <Send className="w-4 h-4" />
                          <span>Sent</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-300 text-sm">
                          <FileText className="w-4 h-4" />
                          <span>Drafts</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-300 text-sm">
                          <Star className="w-4 h-4" />
                          <span>Starred</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-300 text-sm">
                          <TrashIcon className="w-4 h-4" />
                          <span>Trash</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Labels</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-300 text-sm">
                            <Tag className="w-4 h-4 text-amber-500" />
                            <span>Important</span>
                          </div>
                          <div className="flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-300 text-sm">
                            <Tag className="w-4 h-4 text-blue-500" />
                            <span>Promotions</span>
                          </div>
                          <div className="flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-300 text-sm">
                            <Tag className="w-4 h-4 text-purple-500" />
                            <span>Social</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search Mail"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-all duration-300">
                          <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-all duration-300">
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                        <span className="text-xs text-slate-500 ml-2">1-{filteredEmails.length}/200</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-all duration-300">
                          <Reply className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-all duration-300">
                          <Forward className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-all duration-300">
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {filteredEmails.length > 0 ? (
                        filteredEmails.map((email) => (
                          <div 
                            key={email.id} 
                            className={`p-4 hover:bg-slate-50 transition-all duration-200 cursor-pointer ${!email.read ? 'bg-[#f8fafc]' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                <input type="checkbox" className="rounded border-slate-300 text-[#72bf24] focus:ring-[#72bf24] transition-all" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-semibold text-sm ${!email.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                      {email.sender}
                                    </span>
                                    {email.starred && <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                                    {email.label && (
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all duration-300 ${
                                        email.label === 'Important' ? 'bg-amber-50 text-amber-700' :
                                        email.label === 'Promotions' ? 'bg-blue-50 text-blue-700' :
                                        'bg-purple-50 text-purple-700'
                                      }`}>
                                        {email.label}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-400 flex-shrink-0">{email.date}</span>
                                </div>
                                <div className={`text-sm ${!email.read ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                                  {email.subject}
                                </div>
                                <div className="text-sm text-slate-400 truncate">{email.preview}</div>
                                <div className="text-xs text-slate-400 mt-1">{email.email}</div>
                              </div>
                              <div className="flex-shrink-0 flex items-center gap-1">
                                <button className="p-1 hover:bg-slate-200 rounded-lg transition-all duration-300">
                                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                                <button className="p-1 hover:bg-slate-200 rounded-lg transition-all duration-300">
                                  <Star className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-sm text-slate-400">
                          No emails found matching your search.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== COMPANY NEWS VIEW ==================== */}
            {activeTab === 'news' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Company News Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage blog posts and company announcements</p>
                  </div>
                  <button
                    onClick={handleOpenAddNews}
                    className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add News Post</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc]">
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider">
                        <th className="py-4 pl-6 w-[35%]">TITLE</th>
                        <th className="py-4 w-[15%]">CATEGORY</th>
                        <th className="py-4 w-[15%]">AUTHOR</th>
                        <th className="py-4 w-[15%]">DATE</th>
                        <th className="py-4 pr-6 text-right w-[20%]">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredNews.length > 0 ? (
                        filteredNews.map((post) => (
                          <tr key={post.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                            <td className="py-5 pl-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#f0f9e8] border border-[#d3f0b4] flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-110">
                                  <Newspaper className="w-5 h-5 text-[#72bf24]" />
                                </div>
                                <button
                                  onClick={() => handleViewNews(post)}
                                  className="font-bold text-slate-900 text-sm text-left hover:text-[#72bf24] transition-colors duration-300 cursor-pointer"
                                  title="View news details"
                                >
                                  {post.title}
                                </button>
                              </div>
                            </td>
                            <td className="py-5">
                              <span className={"text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 " + (post.category === 'Company News' ? 'bg-blue-50 text-blue-700' : post.category === 'Product Updates' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700')}>
                                {post.category}
                              </span>
                            </td>
                            <td className="py-5 text-sm text-slate-600">{post.author}</td>
                            <td className="py-5 text-sm text-slate-600">{post.date}</td>
                            <td className="py-5 pr-6">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewNews(post)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-blue-600"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditNews(post)}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-[#72bf24]"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNews(post.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <Newspaper className="w-12 h-12 text-slate-300" />
                              <span className="text-sm text-slate-400">No news posts found matching your search.</span>
                              <button
                                onClick={handleOpenAddNews}
                                className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                              >
                                Add your first news post
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== VIEW NEWS MODAL ==================== */}
            {viewNews && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-slate-900">News Details</h3>
                    <button onClick={() => setViewNews(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                      <X className="w-5 h-5" />
                    </button>
                   </div>
                   <div className="space-y-4">
                    {viewNews.imageUrl && (
                      <div className="flex justify-center">
                        <img src={resolveImageUrl(viewNews.imageUrl)} alt={viewNews.title} className="w-full h-48 object-cover rounded-xl border border-slate-200" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
                      <div className="text-sm font-semibold text-slate-900 mt-1">{viewNews.title}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                        <div className="text-sm text-slate-700 mt-1">{viewNews.category}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Author</label>
                        <div className="text-sm text-slate-700 mt-1">{viewNews.author}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</label>
                        <div className="text-sm text-slate-700 mt-1">{viewNews.date}</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Excerpt</label>
                      <div className="text-sm text-slate-700 mt-1 leading-relaxed">{viewNews.excerpt || 'No excerpt provided.'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Content</label>
                      <div className="text-sm text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">{viewNews.content || 'No content provided.'}</div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => { setViewNews(null); handleOpenEditNews(viewNews); }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit News
                    </button>
                    <button
                      onClick={() => setViewNews(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== NEWS MODAL ==================== */}
            {isNewsModalOpen && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 flex flex-col max-h-[90vh] transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-5 shrink-0">
                    <h3 className="text-base font-semibold text-slate-900">
                      {newsModalMode === 'add' ? 'Add New News Post' : 'Edit News Post'}
                    </h3>
                    <button onClick={() => setIsNewsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveNews} className="space-y-4 overflow-y-auto flex-1 pr-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={newsFormData.title}
                        onChange={(e) => setNewsFormData({ ...newsFormData, title: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                        <select
                          value={newsFormData.category}
                          onChange={(e) => setNewsFormData({ ...newsFormData, category: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                        >
                          <option>Company News</option>
                          <option>Product Updates</option>
                          <option>Partnerships</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Author</label>
                        <input
                          type="text"
                          required
                          value={newsFormData.author}
                          onChange={(e) => setNewsFormData({ ...newsFormData, author: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={newsFormData.date}
                        onChange={(e) => setNewsFormData({ ...newsFormData, date: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Excerpt</label>
                      <textarea
                        rows="2"
                        value={newsFormData.excerpt}
                        onChange={(e) => setNewsFormData({ ...newsFormData, excerpt: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                        placeholder="Short summary of the news post..."
                      ></textarea>
                    </div>

                     <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Content</label>
                       <textarea
                         rows="6"
                         value={newsFormData.content}
                         onChange={(e) => setNewsFormData({ ...newsFormData, content: e.target.value })}
                         className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                         placeholder="Full news content..."
                       ></textarea>
                     </div>

                     <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
                       <input
                         type="text"
                         value={newsFormData.imageUrl}
                         onChange={(e) => setNewsFormData({ ...newsFormData, imageUrl: e.target.value })}
                         className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                         placeholder="https://example.com/image.jpg or /uploads/image.jpg"
                       />
                       <p className="text-[10px] text-slate-400 mt-1">Leave empty to use default image. Supports external URLs and local paths.</p>
                     </div>

                     <div className="flex justify-end gap-3 pt-4 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsNewsModalOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        {newsModalMode === 'add' ? 'Add News Post' : 'Update News Post'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ==================== LEGAL & COMPLIANCE VIEWS ==================== */}
            {activeTab.startsWith('legal-') && renderLegalContent()}

            {/* ==================== SETTINGS VIEW ==================== */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings</h1>
                    <p className="text-sm text-slate-500 mt-1">Configure system preferences and user settings</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-900">General Settings</h3>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Dark Mode</span>
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={handleToggleDarkMode} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#72bf24] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#72bf24]"></div>
                          </div>
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Email Notifications</span>
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={emailNotifications} onChange={handleToggleEmailNotifications} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#72bf24] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#72bf24]"></div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-900">Account Preferences</h3>
                      <div className="space-y-2">
                        <button onClick={() => setActiveTab('manage-account')} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-300">Change Password</button>
                        <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-300">Two-Factor Authentication</button>
                        <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-300">Export Data</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== MANAGE ACCOUNT VIEW ==================== */}
            {activeTab === 'manage-account' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Manage Account</h1>
                    <p className="text-sm text-slate-500 mt-1">Update your login credentials</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm max-w-2xl transition-all duration-300 hover:shadow-md">
                  {accountMessage && <div className="mb-4 text-green-600 text-center font-bold bg-green-50 p-3 rounded-xl animate-fade-in">{accountMessage}</div>}
                  {accountError && <div className="mb-4 text-red-500 text-center font-bold animate-shake">{accountError}</div>}
                  <form onSubmit={handleUpdateAccount} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Current Username</label>
                      <input
                        type="text"
                        value={currentUser?.username || ''}
                        disabled
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">New Username</label>
                      <input
                        type="text"
                        value={accountFormData.username}
                        onChange={(e) => setAccountFormData({ ...accountFormData, username: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                        placeholder="Enter new username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={accountFormData.currentPassword}
                        onChange={(e) => setAccountFormData({ ...accountFormData, currentPassword: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={accountFormData.newPassword}
                        onChange={(e) => setAccountFormData({ ...accountFormData, newPassword: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => { setAccountMessage(''); setAccountError(''); }}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                      >
                        Reset
                      </button>
                      <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        Update Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ==================== JOURNEY / MILESTONES ==================== */}
            {activeTab === 'journey' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Journey Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage milestone years and monthly activities for the <span className="text-[#72bf24]">Our Journey</span> section</p>
                  </div>
                  <button
                    onClick={handleOpenAddMilestone}
                    className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Milestone</span>
                  </button>
                </div>

                {viewMilestone ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setViewMilestone(null); setMilestoneActivities([]); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Milestones
                      </button>
                      <h2 className="text-lg font-semibold text-slate-900">{viewMilestone.year} - {viewMilestone.title}</h2>
                      {viewMilestone.icon && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                          <i className={viewMilestone.icon} style={{ color: viewMilestone.color || '#72bf24' }}></i>
                          {viewMilestone.icon}
                        </span>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">Monthly Activities</h3>
                          <p className="text-xs text-slate-500 mt-1">Add month cards that will appear on the public Journey page</p>
                        </div>
                        <button
                          onClick={handleOpenAddActivity}
                          className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          Add Month
                        </button>
                      </div>
                      <div className="p-6">
                        {milestoneActivities.length > 0 ? (
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                             {milestoneActivities.map((activity) => (
                               <div key={activity.id} onClick={() => handleViewActivity(activity)} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-[#72bf24] transition-all duration-300 cursor-pointer">
                                 <div className="flex items-center justify-between mb-2">
                                   <span className="text-xs font-semibold text-[#72bf24] uppercase tracking-wider">{activity.month}</span>
                                   <div className="flex items-center gap-1">
                                     <button
                                       onClick={(e) => { e.stopPropagation(); setSelectedActivity(activity); setActivityModalMode('edit'); setActivityFormData({ month: activity.month, title: activity.title, description: activity.description || '', displayOrder: activity.displayOrder || 0 }); setIsActivityModalOpen(true); }}
                                       className="p-1.5 hover:bg-blue-50 rounded-lg transition-all text-slate-400 hover:text-blue-600"
                                     >
                                       <Pencil className="w-3.5 h-3.5" />
                                     </button>
                                     <button
                                       onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this month?')) { handleDeleteActivity(activity.id); } }}
                                       className="p-1.5 hover:bg-red-50 rounded-lg transition-all text-slate-400 hover:text-red-600"
                                     >
                                       <Trash2 className="w-3.5 h-3.5" />
                                     </button>
                                   </div>
                                 </div>
                                 <h4 className="text-sm font-semibold text-slate-900 mb-1">{activity.title}</h4>
                                 <p className="text-xs text-slate-600 line-clamp-3">{activity.description || 'No description'}</p>
                               </div>
                             ))}
                           </div>
                        ) : (
                           <div className="text-center py-12">
                             <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                             <p className="text-sm text-slate-500">No monthly activities yet for this milestone.</p>
                             <button
                               onClick={handleOpenAddActivity}
                               className="mt-3 text-[#72bf24] text-sm font-semibold hover:underline"
                             >
                               Add your first month
                             </button>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#f8fafc]">
                        <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                           <th className="py-4 pl-6">Year</th>
                           <th className="py-4">Title</th>
                           <th className="py-4">Icon</th>
                           <th className="py-4">Description</th>
                           <th className="py-4 pr-6 text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {filteredMilestones.length > 0 ? (
                           filteredMilestones.map((milestone) => (
                             <tr key={milestone.id} onClick={() => handleViewMilestone(milestone)} className="hover:bg-slate-50/70 transition-colors duration-150 cursor-pointer">
                               <td className="py-5 pl-6">
                                 <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f9e8] text-[#166534] text-sm font-bold border border-[#d3f0b4]">
                                   {milestone.year}
                                 </span>
                               </td>
                               <td className="py-5 text-sm font-bold text-slate-900">{milestone.title}</td>
                               <td className="py-5 text-sm text-slate-600">
                                 {milestone.icon ? (
                                   <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">
                                     <i className={milestone.icon} style={{ color: milestone.color || '#72bf24' }}></i>
                                     <span className="text-[10px] text-slate-500 truncate max-w-[80px]">{milestone.icon.split(' ').pop()}</span>
                                   </span>
                                 ) : (
                                   <span className="text-slate-400">-</span>
                                 )}
                               </td>
                               <td className="py-5 text-sm text-slate-600 max-w-xs truncate">{milestone.description || '-'}</td>
                              <td className="py-5 pr-6">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleViewMilestone(milestone); }}
                                    className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-blue-600"
                                    title="View Months"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenEditMilestone(milestone); }}
                                    className="p-2 hover:bg-green-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-[#72bf24]"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteMilestone(milestone.id); }}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-600"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-16 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <Activity className="w-12 h-12 text-slate-300" />
                                <span className="text-sm text-slate-400">No milestones found matching your search.</span>
                                <button
                                  onClick={handleOpenAddMilestone}
                                  className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                                >
                                  Add your first milestone
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ==================== PRICING VIEW ==================== */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Pricing Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage pricing plans displayed on the website</p>
                  </div>
                  <button
                    onClick={handleOpenAddPricing}
                    className="bg-[#72bf24] hover:bg-[#62a71e] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Plan</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc]">
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 tracking-wider">
                        <th className="py-4 pl-6">PLAN</th>
                        <th className="py-4">PRICE</th>
                        <th className="py-4">FEATURES</th>
                        <th className="py-4">POPULAR</th>
                        <th className="py-4 pr-6 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pricing.length > 0 ? (
                        pricing.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                            <td className="py-5 pl-6">
                              <div className="font-semibold text-slate-900 text-sm">{item.plan}</div>
                            </td>
                            <td className="py-5 text-sm text-slate-600">${item.price}/Monthly</td>
                            <td className="py-5 text-sm text-slate-600">
                              {Array.isArray(item.features) && item.features.length > 0
                                ? item.features.slice(0, 3).join(', ') + (item.features.length > 3 ? '...' : '')
                                : '-'}
                            </td>
                            <td className="py-5 text-sm text-slate-600">
                              {item.popular ? (
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eaf6de] text-[#5b9b1d]">Yes</span>
                              ) : (
                                <span className="text-slate-400">No</span>
                              )}
                            </td>
                            <td className="py-5 pr-6">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewPricing(item)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-blue-600"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditPricing(item)}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-[#72bf24]"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePricing(item.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <DollarSign className="w-12 h-12 text-slate-300" />
                              <span className="text-sm text-slate-400">No pricing plans found.</span>
                              <button
                                onClick={handleOpenAddPricing}
                                className="text-[#72bf24] text-sm font-semibold hover:underline transition-colors"
                              >
                                Add your first plan
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* ==================== VIEW APPLICANT MODAL ==================== */}
        {viewApplicant && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900">Applicant Details</h3>
                <button onClick={() => setViewApplicant(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#f0f9e8] border border-[#d3f0b4] flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-[#72bf24]">
                      {viewApplicant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{viewApplicant.name}</div>
                    <div className="text-xs text-slate-400">{viewApplicant.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Opportunity</label>
                    <div className="text-sm text-slate-700 mt-1">{viewApplicant.opportunity}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Sex</label>
                    <div className="text-sm text-slate-700 mt-1">{viewApplicant.sex || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</label>
                    <div className="text-sm text-slate-700 mt-1">{viewApplicant.phone || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                    <div className="text-sm text-slate-700 mt-1">{viewApplicant.location || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience</label>
                    <div className="text-sm text-slate-700 mt-1">{viewApplicant.experience || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied Date</label>
                    <div className="text-sm text-slate-700 mt-1">{viewApplicant.appliedDate}</div>
                  </div>
                </div>
                {viewApplicant.cv_url && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">CV</label>
                    <a 
                      href={viewApplicant.cv_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-2 text-sm text-[#72bf24] hover:text-[#62a71e] hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 14l4-4v12a2 2 0 01-2 2H6a2 2 0 01-2-2z"></path></svg>
                      {viewApplicant.cv_name || 'Download CV'}
                    </a>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                  <div className="mt-1">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 ${
                      viewApplicant.status === 'PENDING' 
                        ? 'bg-amber-50 text-amber-700' 
                        : viewApplicant.status === 'REVIEWED'
                        ? 'bg-blue-50 text-blue-700'
                        : viewApplicant.status === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {viewApplicant.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => { setViewApplicant(null); handleOpenEditApplicant(viewApplicant); }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Applicant
                </button>
                <button
                  onClick={() => setViewApplicant(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== APPLICANT MODAL ==================== */}
        {isApplicantModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-100 flex flex-col max-h-[90vh] transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <h3 className="text-base font-semibold text-slate-900">
                  {applicantModalMode === 'add' ? 'Add New Applicant' : 'Edit Applicant'}
                </h3>
                <button onClick={() => setIsApplicantModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveApplicant} className="space-y-4 overflow-y-auto flex-1 pr-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={applicantFormData.name}
                      onChange={(e) => setApplicantFormData({ ...applicantFormData, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={applicantFormData.email}
                      onChange={(e) => setApplicantFormData({ ...applicantFormData, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity</label>
                    <select
                      required
                      value={applicantFormData.opportunity}
                      onChange={(e) => setApplicantFormData({ ...applicantFormData, opportunity: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    >
                      <option value="">Select opportunity</option>
                      {getUniqueOpportunities().map(opp => (
                        <option key={opp} value={opp}>{opp}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sex</label>
                    <select
                      value={applicantFormData.sex}
                      onChange={(e) => setApplicantFormData({ ...applicantFormData, sex: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    >
                      <option value="">Select sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
                    <input
                      type="text"
                      value={applicantFormData.experience}
                      onChange={(e) => setApplicantFormData({ ...applicantFormData, experience: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                      placeholder="e.g. 5 years"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Applied Date</label>
                    <input
                      type="date"
                      value={applicantFormData.appliedDate}
                      onChange={(e) => setApplicantFormData({ ...applicantFormData, appliedDate: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={applicantFormData.status}
                    onChange={(e) => setApplicantFormData({ ...applicantFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsApplicantModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    {applicantModalMode === 'add' ? 'Add Applicant' : 'Update Applicant'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

         {/* ==================== VIEW PRODUCT MODAL ==================== */}
        {viewProduct && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900">Product Details</h3>
                <button onClick={() => setViewProduct(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {viewProduct.logoUrl && (
                  <div className="flex justify-center">
                     <img src={resolveImageUrl(viewProduct.logoUrl)} alt={viewProduct.name} className="w-24 h-24 object-contain rounded-xl border border-slate-200 bg-slate-50" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</label>
                  <div className="text-sm font-semibold text-slate-900 mt-1">{viewProduct.name}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Tagline</label>
                  <div className="text-sm text-slate-700 mt-1">{viewProduct.tagline}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                  <div className="text-sm text-slate-700 mt-1">{viewProduct.category}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                  <div className="text-sm text-slate-700 mt-1 leading-relaxed">{viewProduct.description || 'No description provided.'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Features</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(viewProduct.keyFeatures || []).map((feature, idx) => (
                      <span key={idx} className="text-xs font-semibold bg-[#f0f9e8] text-[#166534] px-2.5 py-1 rounded-lg border border-[#d3f0b4]">
                        {feature}
                      </span>
                    ))}
                    {(!viewProduct.keyFeatures || viewProduct.keyFeatures.length === 0) && (
                      <span className="text-xs text-slate-400">No key features defined.</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => { setViewProduct(null); handleOpenEditProduct(viewProduct); }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Product
                </button>
                <button
                  onClick={() => setViewProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW OPPORTUNITY MODAL ==================== */}
        {viewOpportunity && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900">Opportunity Details</h3>
                <button onClick={() => setViewOpportunity(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</label>
                  <div className="text-sm font-semibold text-slate-900 mt-1">{viewOpportunity.title}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                  <div className="text-sm text-slate-700 mt-1">{viewOpportunity.location}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
                  <div className="text-sm text-slate-700 mt-1">{viewOpportunity.type}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications</label>
                  <div className="text-sm text-slate-700 mt-1">{viewOpportunity.applications || 0}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Requirements</label>
                  <div className="text-sm text-slate-700 mt-1">{viewOpportunity.keyRequirements || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                  <div className="text-sm text-slate-700 mt-1 leading-relaxed">{viewOpportunity.description || 'No description provided.'}</div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => { setViewOpportunity(null); handleOpenEditOpportunity(viewOpportunity); }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Opportunity
                </button>
                <button
                  onClick={() => setViewOpportunity(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== OPPORTUNITY MODAL ==================== */}
        {isOpportunityModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-100 flex flex-col max-h-[90vh] transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <h3 className="text-base font-semibold text-slate-900">
                  {opportunityModalMode === 'add' ? 'Add New Opportunity' : 'Edit Opportunity'}
                </h3>
                <button onClick={() => setIsOpportunityModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveOpportunity} className="space-y-4 overflow-y-auto flex-1 pr-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={opportunityFormData.title}
                    onChange={(e) => setOpportunityFormData({ ...opportunityFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={opportunityFormData.location}
                      onChange={(e) => setOpportunityFormData({ ...opportunityFormData, location: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                    <select
                      value={opportunityFormData.type}
                      onChange={(e) => setOpportunityFormData({ ...opportunityFormData, type: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Deferred Payment</option>
                      <option>Internship</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Key Requirements</label>
                  <textarea
                    rows="2"
                    value={opportunityFormData.keyRequirements}
                    onChange={(e) => setOpportunityFormData({ ...opportunityFormData, keyRequirements: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                    placeholder="e.g. 5+ years experience, React, Node.js..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows="4"
                    value={opportunityFormData.description}
                    onChange={(e) => setOpportunityFormData({ ...opportunityFormData, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                    placeholder="Enter job description or generate with AI..."
                  ></textarea>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDescription}
                    className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    {isGeneratingDescription ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Auto Generate with AI
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Applications</label>
                    <input
                      type="number"
                      min="0"
                      value={opportunityFormData.applications}
                      onChange={(e) => setOpportunityFormData({ ...opportunityFormData, applications: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={opportunityFormData.status}
                      onChange={(e) => setOpportunityFormData({ ...opportunityFormData, status: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    >
                      <option>Active</option>
                      <option>Terminated</option>
                      <option>Draft</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsOpportunityModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    {opportunityModalMode === 'add' ? 'Add Opportunity' : 'Update Opportunity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== PRODUCT MODAL ==================== */}
        {isProductModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900">
                  {productModalMode === 'add' ? 'Add New Product' : 'Edit Product'}
                </h3>
                <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    required
                    value={productFormData.tagline}
                    onChange={(e) => setProductFormData({ ...productFormData, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={productFormData.logoUrl}
                    onChange={(e) => setProductFormData({ ...productFormData, logoUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                    placeholder="Enter product description..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Key Features</label>
                  <textarea
                    rows="2"
                    value={productFormData.keyFeatures}
                    onChange={(e) => setProductFormData({ ...productFormData, keyFeatures: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                    placeholder="Feature 1, Feature 2, Feature 3"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Separate features with commas</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    {productModalMode === 'add' ? 'Add Product' : 'Update Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

         {/* ==================== MILESTONE MODAL ==================== */}
         {isMilestoneModalOpen && (
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
               <div className="flex items-center justify-between mb-5">
                 <h3 className="text-base font-semibold text-slate-900">
                   {milestoneModalMode === 'add' ? 'Add New Milestone' : 'Edit Milestone'}
                 </h3>
                 <button
                   onClick={() => setIsMilestoneModalOpen(false)}
                   className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <form onSubmit={handleSaveMilestone} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                     <input
                       type="number"
                       required
                       value={milestoneFormData.year}
                       onChange={(e) => setMilestoneFormData({ ...milestoneFormData, year: e.target.value })}
                       className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                       placeholder="e.g. 2024"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Display Order</label>
                     <input
                       type="number"
                       value={milestoneFormData.displayOrder}
                       onChange={(e) => setMilestoneFormData({ ...milestoneFormData, displayOrder: Number(e.target.value) })}
                       className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                       placeholder="0"
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                   <input
                     type="text"
                     required
                     value={milestoneFormData.title}
                     onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                     className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                     placeholder="e.g. Company Founded"
                   />
                 </div>

                 <div>
                   <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                   <textarea
                     value={milestoneFormData.description}
                     onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                     className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                     rows="3"
                     placeholder="Brief description of this milestone..."
                   />
                 </div>

                 <div>
                   <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
                   <div className="flex items-center gap-3">
                     <input
                       type="color"
                       value={milestoneFormData.color}
                       onChange={(e) => setMilestoneFormData({ ...milestoneFormData, color: e.target.value })}
                       className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-1"
                     />
                    <span className="text-xs text-slate-500">{milestoneFormData.color}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Icon</label>
                    <select
                      value={milestoneFormData.icon}
                      onChange={(e) => setMilestoneFormData({ ...milestoneFormData, icon: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all bg-white"
                    >
                      <option value="">-- Select an icon --</option>
                      <optgroup label="Business & Work">
                        <option value="fa-solid fa-lightbulb">💡 Lightbulb</option>
                        <option value="fa-solid fa-briefcase">💼 Briefcase</option>
                        <option value="fa-solid fa-handshake">🤝 Handshake</option>
                        <option value="fa-solid fa-building">🏢 Building</option>
                        <option value="fa-solid fa-users">👥 Users</option>
                        <option value="fa-solid fa-chart-line">📈 Chart Line</option>
                        <option value="fa-solid fa-chart-bar">📊 Chart Bar</option>
                        <option value="fa-solid fa-globe">🌍 Globe</option>
                      </optgroup>
                      <optgroup label="Technology & Innovation">
                        <option value="fa-solid fa-rocket">🚀 Rocket</option>
                        <option value="fa-solid fa-code">💻 Code</option>
                        <option value="fa-solid fa-database">🗄️ Database</option>
                        <option value="fa-solid fa-server">🖥️ Server</option>
                        <option value="fa-solid fa-cloud">☁️ Cloud</option>
                        <option value="fa-solid fa-shield-halved">🛡️ Shield</option>
                        <option value="fa-solid fa-microchip">🔬 Microchip</option>
                        <option value="fa-solid fa-gears">⚙️ Gears</option>
                      </optgroup>
                      <optgroup label="Growth & Success">
                        <option value="fa-solid fa-trophy">🏆 Trophy</option>
                        <option value="fa-solid fa-medal">🥇 Medal</option>
                        <option value="fa-solid fa-star">⭐ Star</option>
                        <option value="fa-solid fa-flag">🚩 Flag</option>
                        <option value="fa-solid fa-mountain">⛰️ Mountain</option>
                        <option value="fa-solid fa-arrow-trend-up">📈 Trending Up</option>
                      </optgroup>
                      <optgroup label="Communication & Ideas">
                        <option value="fa-solid fa-comments">💬 Comments</option>
                        <option value="fa-solid fa-envelope">✉️ Envelope</option>
                        <option value="fa-solid fa-bullhorn">📢 Bullhorn</option>
                        <option value="fa-solid fa-lightbulb">💡 Idea</option>
                        <option value="fa-solid fa-pen-to-square">📝 Pen</option>
                      </optgroup>
                    </select>
                    {milestoneFormData.icon && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <span>Preview:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-50 border border-slate-200">
                          <i className={milestoneFormData.icon} style={{ color: milestoneFormData.color }}></i>
                          {milestoneFormData.icon}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsMilestoneModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                      {milestoneModalMode === 'add' ? 'Add Milestone' : 'Update Milestone'}
                    </button>
                  </div>
               </form>
             </div>
           </div>
         )}

         {/* ==================== ACTIVITY MODAL ==================== */}
         {isActivityModalOpen && (
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
               <div className="flex items-center justify-between mb-5">
                 <h3 className="text-base font-semibold text-slate-900">
                   {activityModalMode === 'add' ? 'Add Monthly Activity' : 'Edit Monthly Activity'}
                 </h3>
                 <button
                   onClick={() => setIsActivityModalOpen(false)}
                   className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <form onSubmit={handleSaveActivity} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Month</label>
                     <input
                       type="text"
                       required
                       value={activityFormData.month}
                       onChange={(e) => setActivityFormData({ ...activityFormData, month: e.target.value })}
                       className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                       placeholder="e.g. January"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Display Order</label>
                     <input
                       type="number"
                       value={activityFormData.displayOrder}
                       onChange={(e) => setActivityFormData({ ...activityFormData, displayOrder: Number(e.target.value) })}
                       className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                       placeholder="0"
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                   <input
                     type="text"
                     required
                     value={activityFormData.title}
                     onChange={(e) => setActivityFormData({ ...activityFormData, title: e.target.value })}
                     className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                     placeholder="e.g. Product Launch"
                   />
                 </div>

                 <div>
                   <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                   <textarea
                     value={activityFormData.description}
                     onChange={(e) => setActivityFormData({ ...activityFormData, description: e.target.value })}
                     className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                     rows="3"
                     placeholder="Details about this month's activity..."
                   />
                 </div>

                 <div className="flex justify-end gap-3 pt-4">
                   <button
                     type="button"
                     onClick={() => setIsActivityModalOpen(false)}
                     className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                   >
                     Cancel
                   </button>
                   <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                     {activityModalMode === 'add' ? 'Add Month' : 'Update Month'}
                   </button>
                 </div>
               </form>
             </div>
           </div>
         )}

         {/* ==================== VIEW ACTIVITY MODAL ==================== */}
         {viewActivity && (
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
               <div className="flex items-center justify-between mb-5">
                 <h3 className="text-base font-semibold text-slate-900">Activity Details</h3>
                 <button onClick={() => setViewActivity(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</label>
                   <div className="text-sm font-semibold text-slate-900 mt-1">{viewActivity.month}</div>
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
                   <div className="text-sm text-slate-700 mt-1">{viewActivity.title}</div>
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                   <div className="text-sm text-slate-700 mt-1 leading-relaxed">{viewActivity.description || 'No description provided.'}</div>
                 </div>
               </div>
               <div className="flex justify-end gap-3 pt-4">
                 <button
                   onClick={() => { setViewActivity(null); setSelectedActivity(viewActivity); setActivityModalMode('edit'); setActivityFormData({ month: viewActivity.month, title: viewActivity.title, description: viewActivity.description || '', displayOrder: viewActivity.displayOrder || 0 }); setIsActivityModalOpen(true); }}
                   className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                 >
                   <Pencil className="w-3.5 h-3.5" />
                   Edit Activity
                 </button>
                 <button
                   onClick={() => setViewActivity(null)}
                   className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                 >
                   Close
                 </button>
               </div>
             </div>
           </div>
         )}

          {/* ==================== VIEW PARTNER MODAL ==================== */}
        {viewPartner && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900">Partner Details</h3>
                <button onClick={() => setViewPartner(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#f0f9e8] border border-[#d3f0b4] flex items-center justify-center shrink-0">
                    <Building2 className="w-8 h-8 text-[#72bf24]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{viewPartner.name}</div>
                    <div className="text-xs text-slate-400">{viewPartner.industry} â€¢ {viewPartner.location}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Name</label>
                    <div className="text-sm text-slate-700 mt-1">{viewPartner.contactName || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Email</label>
                    <div className="text-sm text-slate-700 mt-1">{viewPartner.contactEmail || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</label>
                    <div className="text-sm text-slate-700 mt-1">{viewPartner.joined}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                    <div className="mt-1">
                      <span className={"text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 " + (viewPartner.status === 'ACTIVE' ? "bg-[#dcfce7] text-[#166534]" : "bg-red-50 text-red-700")}>
                        {viewPartner.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => { setViewPartner(null); handleOpenEditPartner(viewPartner); }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Partner
                </button>
                <button
                  onClick={() => setViewPartner(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PARTNER MODAL ==================== */}
        {isPartnerModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 flex flex-col max-h-[90vh] transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <h3 className="text-base font-semibold text-slate-900">
                  {partnerModalMode === 'add' ? 'Add New Partner' : 'Edit Partner'}
                </h3>
                <button onClick={() => setIsPartnerModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePartner} className="space-y-4 overflow-y-auto flex-1 pr-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Partner Name</label>
                  <input
                    type="text"
                    required
                    value={partnerFormData.name}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                    <input
                      type="text"
                      required
                      value={partnerFormData.industry}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, industry: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={partnerFormData.location}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, location: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={partnerFormData.contactName}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, contactName: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={partnerFormData.contactEmail}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={partnerFormData.status}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPartnerModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    {partnerModalMode === 'add' ? 'Add Partner' : 'Update Partner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== PRICING MODAL ==================== */}
        {isPricingModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-100 flex flex-col max-h-[90vh] transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <h3 className="text-base font-semibold text-slate-900">
                  {pricingModalMode === 'add' ? 'Add Pricing Plan' : 'Edit Pricing Plan'}
                </h3>
                <button onClick={() => setIsPricingModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSavePricing} className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plan</label>
                  <input
                    type="text"
                    required
                    value={pricingFormData.plan}
                    onChange={(e) => setPricingFormData({ ...pricingFormData, plan: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    placeholder="e.g. Basic, Pro, Enterprise"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price</label>
                  <input
                    type="number"
                    required
                    value={pricingFormData.price}
                    onChange={(e) => setPricingFormData({ ...pricingFormData, price: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Features</label>
                  <textarea
                    rows="4"
                    value={pricingFormData.features}
                    onChange={(e) => setPricingFormData({ ...pricingFormData, features: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  ></textarea>
                  <p className="text-[10px] text-slate-400 mt-1">One feature per line</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={pricingFormData.popular}
                    onChange={(e) => setPricingFormData({ ...pricingFormData, popular: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#72bf24] focus:ring-[#72bf24] transition-all"
                  />
                  <label htmlFor="popular" className="text-xs font-semibold text-slate-700">Popular</label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={pricingFormData.display_order}
                    onChange={(e) => setPricingFormData({ ...pricingFormData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPricingModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    {pricingModalMode === 'add' ? 'Add Pricing Plan' : 'Update Pricing Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== VIEW PRICING MODAL ==================== */}
        {viewPricing && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900">Pricing Plan Details</h3>
                <button onClick={() => setViewPricing(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</label>
                  <div className="text-sm font-semibold text-slate-900 mt-1">{viewPricing.plan}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</label>
                  <div className="text-sm font-semibold text-slate-900 mt-1">${viewPricing.price}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Features</label>
                  <ul className="mt-2 space-y-1">
                    {viewPricing.features && viewPricing.features.length > 0 ? (
                      viewPricing.features.map((feature, index) => (
                        <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-[#72bf24] mt-1">â€¢</span>
                          {feature}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-400">No features specified</li>
                    )}
                  </ul>
                </div>
                {viewPricing.popular && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                    <div className="mt-1">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#dcfce7] text-[#166534]">
                        Popular
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => setViewPricing(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SERVICE MODAL ==================== */}
        {isServiceModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900">
                  {serviceModalMode === 'add' ? 'Add New Service' : 'Edit Service'}
                </h3>
                <button onClick={() => setIsServiceModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title</label>
                  <input
                    type="text"
                    required
                    value={serviceFormData.title}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={serviceFormData.subtitle}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={serviceFormData.imageUrl}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all"
                    placeholder="https://example.com/image.png"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    value={serviceFormData.description}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                    placeholder="Enter service description..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Summary</label>
                  <textarea
                    rows="2"
                    value={serviceFormData.summary}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, summary: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                    placeholder="Short summary shown in cards..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Key Features</label>
                  <textarea
                    rows="2"
                    value={serviceFormData.features}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, features: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#72bf24] focus:ring-1 focus:ring-[#72bf24] transition-all resize-none"
                    placeholder="Feature 1, Feature 2, Feature 3"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Separate features with commas</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    {serviceModalMode === 'add' ? 'Add Service' : 'Update Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== VIEW SERVICE MODAL ==================== */}
        {viewService && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900">Service Details</h3>
                <button onClick={() => setViewService(null)} className="text-slate-400 hover:text-slate-600 p-1 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {viewService.imageUrl && (
                  <div className="flex justify-center">
                     <img src={resolveImageUrl(viewService.imageUrl)} alt={viewService.title} className="w-24 h-24 object-contain rounded-xl border border-slate-200 bg-slate-50" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Title</label>
                  <div className="text-sm font-semibold text-slate-900 mt-1">{viewService.title}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtitle</label>
                  <div className="text-sm text-slate-700 mt-1">{viewService.subtitle || 'No subtitle provided.'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                  <div className="text-sm text-slate-700 mt-1 leading-relaxed">{viewService.description || 'No description provided.'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Summary</label>
                  <div className="text-sm text-slate-700 mt-1 leading-relaxed">{viewService.summary || 'No summary provided.'}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Features</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(viewService.features || []).map((feature, idx) => (
                      <span key={idx} className="text-xs font-semibold bg-[#f0f9e8] text-[#166534] px-2.5 py-1 rounded-lg border border-[#d3f0b4]">
                        {feature}
                      </span>
                    ))}
                    {(!viewService.features || viewService.features.length === 0) && (
                      <span className="text-xs text-slate-400">No key features defined.</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => { setViewService(null); handleOpenEditService(viewService); }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#72bf24] hover:bg-[#62a71e] rounded-xl transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Service
                </button>
                <button
                  onClick={() => setViewService(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STATS DETAIL MODAL ==================== */}
        {viewStatsDetail && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl border border-slate-100 flex flex-col max-h-[85vh] transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {viewStatsDetail.type === 'comments' ? 'Comments by Article' : viewStatsDetail.type === 'views' ? 'Views by Post' : 'Subscribers'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {viewStatsDetail.type === 'comments' ? `${viewStatsDetail.data.reduce((sum, a) => sum + (a.totalComments || 0), 0)} total comments across ${viewStatsDetail.data.length} articles` : viewStatsDetail.type === 'views' ? `${viewStatsDetail.data.reduce((sum, p) => sum + (p.views || 0), 0)} total views across ${viewStatsDetail.data.length} posts` : `${viewStatsDetail.data.length} subscribers`}
                  </p>
                </div>
                <button onClick={() => { console.log('Closing modal, current data:', viewStatsDetail); setViewStatsDetail(null); }} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all duration-300 hover:rotate-90">
                  <X className="w-5 h-5" />
                </button>
              </div>
               <div className="overflow-y-auto flex-1 custom-scrollbar p-6">
                  {viewStatsDetail.type === 'comments' && viewStatsDetail.data.map((article) => {
                    const articleTitle = (newsPosts || []).find((n) => n.id === article.articleId)?.title || 'Unknown Article';
                    const comments = article.comments || [];
                    return (
                     <div key={article.articleId} className="mb-6 last:mb-0 p-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50/80 to-white">
                       <div className="flex items-center justify-between mb-3">
                         <h4 className="text-sm font-semibold text-slate-900">{articleTitle}</h4>
                         <button
                           onClick={() => handleClearArticleComments(article)}
                           className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors duration-200"
                         >
                           Clear Comments
                         </button>
                       </div>
                       {comments.length === 0 ? (
                         <div className="text-center py-6 text-slate-400 text-sm">No comments yet.</div>
                       ) : (
                         <div className="space-y-3">
                           {comments.map((comment) => (
                             <div key={comment._id || comment.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100">
                               <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-1">
                                   <span className="text-sm font-semibold text-slate-900">{comment.author || 'Anonymous'}</span>
                                   <span className="text-[10px] text-slate-400">{new Date(comment.createdAt || comment.created_at).toLocaleDateString()}</span>
                                 </div>
                                 <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                                 {comment.replies && comment.replies.length > 0 && (
                                   <div className="mt-2 ml-4 space-y-2">
                                     {comment.replies.map((reply) => (
                                       <div key={reply._id || reply.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                         <div className="flex items-center gap-2 mb-1">
                                           <span className="text-xs font-semibold text-slate-900">{reply.author || 'Anonymous'}</span>
                                           <span className="text-[10px] text-slate-400">{new Date(reply.createdAt || reply.created_at).toLocaleDateString()}</span>
                                         </div>
                                         <p className="text-xs text-slate-600">{reply.content}</p>
                                       </div>
                                     ))}
                                   </div>
                                 )}
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                    );
                  })}
                {viewStatsDetail.type === 'views' && viewStatsDetail.data.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50/80 to-white mb-3 last:mb-0">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{post.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{post.category || 'Uncategorized'} â€¢ {post.date || 'No date'}</p>
                    </div>
                    <span className="text-sm font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">{post.views || 0} views</span>
                  </div>
                ))}
                 {viewStatsDetail.type === 'subscribers' && (
                   <div className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50/80 to-white">
                     <div className="flex items-center justify-between mb-4">
                       <h4 className="text-sm font-semibold text-slate-900">All Subscribers</h4>
                       <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">{viewStatsDetail.data.length} subscribers</span>
                     </div>
                     {viewStatsDetail.data.length === 0 ? (
                       <div className="text-center py-8 text-slate-400 text-sm">No subscribers yet.</div>
                     ) : (
                       <div className="space-y-3">
                         {viewStatsDetail.data.map((sub) => (
                           <div key={sub.id} className="flex items-center justify-between py-2">
                             <div>
                               <h4 className="text-sm font-semibold text-slate-900">{sub.email}</h4>
                               <p className="text-xs text-slate-400 mt-0.5">{sub.name || 'No name'} â€¢ {new Date(sub.subscribed_at).toLocaleDateString()}</p>
                             </div>
                             <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Subscriber</span>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
