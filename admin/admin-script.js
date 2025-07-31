import { 
    checkAuthState, 
    logoutUser, 
    getActivities, 
    getMessages,
    initializeUserProfile,
    saveUserProfile,
    getUserProfile,
    getAllAdminUsers,
    updateUserStatus,
    deleteAdminUser,
    getSystemSettings,
    updateSystemSettings,
    uploadProfilePicture,
    changePassword
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Wait for authentication state to be determined
    let authStateResolved = false;
    
    // Check authentication state
    checkAuthState(async (user) => {
        if (authStateResolved) return; // Prevent multiple executions
        authStateResolved = true;
        
        if (!user) {
            // User is not logged in, redirect to login
            window.location.href = './login.html';
            return;
        }
        
        console.log('User authenticated:', user.email);
        
        // User is logged in, initialize profile first
        try {
            await initializeUserProfile(user);
            console.log('User profile initialized');
            
            // Then update UI and load data
            updateUserProfile(user);
            
            // Wait a bit for auth token to propagate
            setTimeout(() => {
                loadDashboardData();
                loadSettingsData();
            }, 1000);
            
        } catch (error) {
            console.error('Error initializing user profile:', error);
        }
    });
    // Get DOM elements
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const logoToggle = document.getElementById('logoToggle');
    const sidebarExpandBtn = document.getElementById('sidebarExpandBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.querySelector('.page-title');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Sidebar toggle functionality
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }

    // Mobile menu toggle
    function toggleMobileMenu() {
        sidebar.classList.toggle('mobile-open');
        sidebarOverlay.classList.toggle('active');
    }
    
    // Close mobile menu when overlay is clicked
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Load sidebar state from localStorage
    function loadSidebarState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }

    // Load page state from localStorage
    function loadPageState() {
        const currentSection = localStorage.getItem('currentSection') || 'dashboard';
        const currentTab = localStorage.getItem('currentTab') || 'profile';
        
        // Set active menu item
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === currentSection) {
                item.classList.add('active');
            }
        });
        
        // Set active content section
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === currentSection + '-section') {
                section.classList.add('active');
            }
        });
        
        // Update page title
        const activeMenuItem = document.querySelector(`.menu-item[data-section="${currentSection}"]`);
        if (activeMenuItem) {
            const menuText = activeMenuItem.querySelector('.menu-text').textContent;
            pageTitle.textContent = menuText;
        }
        
        // Set active tab if in settings section
        if (currentSection === 'setting') {
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-tab') === currentTab) {
                    btn.classList.add('active');
                }
            });
            
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === currentTab + '-tab') {
                    pane.classList.add('active');
                }
            });
        }
    }

    // Handle menu item clicks
    function handleMenuClick(e) {
        e.preventDefault();
        
        // Remove active class from all menu items
        menuItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Get target section
        const targetSection = this.getAttribute('data-section');
        
        // Save current section to localStorage
        localStorage.setItem('currentSection', targetSection);
        
        // Hide all content sections
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Show target section
        const targetElement = document.getElementById(targetSection + '-section');
        if (targetElement) {
            targetElement.classList.add('active');
        }
        
        // Update page title
        const menuText = this.querySelector('.menu-text').textContent;
        pageTitle.textContent = menuText;
        
        // Close mobile menu if open
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('mobile-open');
        }
    }

    // Handle tab clicks in settings
    function handleTabClick(e) {
        e.preventDefault();
        
        // Remove active class from all tab buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Get target tab
        const targetTab = this.getAttribute('data-tab');
        
        // Save current tab to localStorage
        localStorage.setItem('currentTab', targetTab);
        
        // Hide all tab panes
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Show target tab pane
        const targetPane = document.getElementById(targetTab + '-tab');
        if (targetPane) {
            targetPane.classList.add('active');
        }
    }

    // Initialize notifications
    function initializeNotifications() {
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', function() {
                showNotificationPanel();
            });
        }
    }

    // Show notification panel (placeholder)
    function showNotificationPanel() {
        alert('Notification panel would open here');
    }

    // Handle logout
    function handleLogout() {
        showLogoutModal();
    }
    
    // Show logout confirmation modal
    function showLogoutModal() {
        const modal = document.getElementById('logoutModalOverlay');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }
    
    // Hide logout modal
    function hideLogoutModal() {
        const modal = document.getElementById('logoutModalOverlay');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    }
    
    // Perform actual logout
    async function performLogout() {
        const confirmBtn = document.getElementById('confirmLogoutBtn');
        const btnText = confirmBtn.querySelector('.btn-text');
        const btnLoader = confirmBtn.querySelector('.btn-loader');
        
        try {
            // Show loading state
            confirmBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'flex';
            
            const result = await logoutUser();
            if (result.success) {
                // Clear any local storage
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('currentSection');
                localStorage.removeItem('currentTab');
                localStorage.removeItem('sidebarCollapsed');
                
                // Hide modal and redirect
                hideLogoutModal();
                window.location.href = './login.html';
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            
            // Reset button state
            confirmBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            
            // Show error (you could create another modal for this)
            alert('An error occurred during logout. Please try again.');
        }
    }

    // Update user profile in UI
    async function updateUserProfile(user) {
        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');
        
        if (userName) {
            userName.textContent = user.displayName || user.email.split('@')[0];
        }
        
        if (userRole) {
            userRole.textContent = 'Administrator';
        }
        
        // Update avatars with user profile data
        await updateUserAvatars(user);
        
        console.log('User profile updated:', user.email);
    }

    // Update all user avatars in the interface
    async function updateUserAvatars(user) {
        try {
            // Get user profile data from Firestore
            const profileResult = await getUserProfile(user.uid);
            let userData = profileResult.success ? profileResult.data : null;
            
            // Fallback to Firebase user data if no profile data
            if (!userData) {
                userData = {
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL,
                    email: user.email
                };
            }
            
            // Update sidebar avatar
            const sidebarAvatar = document.querySelector('.sidebar .user-avatar');
            if (sidebarAvatar) {
                updateAvatarElement(sidebarAvatar, userData);
            }
            
            // Update header avatar
            const headerAvatar = document.querySelector('.header-right .profile-img');
            if (headerAvatar) {
                if (userData.photoURL) {
                    headerAvatar.src = userData.photoURL;
                    headerAvatar.alt = userData.displayName || 'User';
                } else {
                    // Replace img with initials if no photo
                    const initials = getInitials(userData);
                    const avatarContainer = headerAvatar.parentElement;
                    avatarContainer.innerHTML = `
                        <div class="profile-avatar-initials">
                            ${initials}
                        </div>
                    `;
                }
            }
            
        } catch (error) {
            console.error('Error updating user avatars:', error);
        }
    }

    // Update a single avatar element
    function updateAvatarElement(avatarElement, userData) {
        if (userData.photoURL) {
            avatarElement.innerHTML = `<img src="${userData.photoURL}" alt="${userData.displayName || 'User'}">`;
        } else {
            const initials = getInitials(userData);
            avatarElement.innerHTML = `<span class="avatar-initials">${initials}</span>`;
        }
    }

    // Get user initials
    function getInitials(userData) {
        if (userData.displayName) {
            return userData.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
        } else if (userData.firstName && userData.lastName) {
            return (userData.firstName[0] + userData.lastName[0]).toUpperCase();
        } else {
            return userData.email[0].toUpperCase();
        }
    }

    // Load dashboard data from Firebase
    async function loadDashboardData() {
        try {
            // Load activities
            const activitiesResult = await getActivities();
            if (activitiesResult.success) {
                updateActivitiesUI(activitiesResult.data);
            }
            
            // Load messages
            const messagesResult = await getMessages();
            if (messagesResult.success) {
                updateMessagesUI(messagesResult.data);
                updateNotificationCount(messagesResult.data);
            }
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    // Update activities in UI
    function updateActivitiesUI(activities) {
        const activitiesContainer = document.querySelector('.activities-grid');
        if (!activitiesContainer || activities.length === 0) return;
        
        // Clear existing activities
        activitiesContainer.innerHTML = '';
        
        activities.slice(0, 6).forEach(activity => {
            const activityCard = document.createElement('div');
            activityCard.className = 'activity-card';
            
            const date = activity.timestamp ? new Date(activity.timestamp.seconds * 1000) : new Date();
            
            activityCard.innerHTML = `
                <div class="activity-header">
                    <h4>${activity.title || 'Activity'}</h4>
                    <span class="activity-status ${activity.status || 'active'}">${activity.status || 'Active'}</span>
                </div>
                <p>${activity.description || 'No description available'}</p>
                <div class="activity-meta">
                    <span><i class="fas fa-calendar"></i> ${date.toLocaleDateString()}</span>
                    <span><i class="fas fa-users"></i> ${activity.participants || 0} participants</span>
                </div>
            `;
            
            activitiesContainer.appendChild(activityCard);
        });
    }

    // Update messages in UI
    function updateMessagesUI(messages) {
        const messagesContainer = document.querySelector('.messages-container');
        if (!messagesContainer || messages.length === 0) return;
        
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        messages.slice(0, 10).forEach(message => {
            const messageItem = document.createElement('div');
            messageItem.className = `message-item ${message.status === 'unread' ? 'unread' : ''}`;
            
            const date = message.timestamp ? new Date(message.timestamp.seconds * 1000) : new Date();
            const timeAgo = getTimeAgo(date);
            
            messageItem.innerHTML = `
                <div class="message-sender">
                    <div class="sender-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="sender-info">
                        <h5>${message.name || 'Unknown Sender'}</h5>
                        <p>${message.subject || 'No subject'}</p>
                    </div>
                </div>
                <div class="message-time">${timeAgo}</div>
            `;
            
            messagesContainer.appendChild(messageItem);
        });
    }

    // Update notification count
    function updateNotificationCount(messages) {
        const unreadCount = messages.filter(msg => msg.status === 'unread').length;
        
        // Update notification badges
        const notificationBadges = document.querySelectorAll('.notification-badge, .notification-count');
        notificationBadges.forEach(badge => {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        });
    }

    // Helper function to get time ago
    function getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }

    // Initialize search functionality
    function initializeSearch() {
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                // Implement search functionality here
                console.log('Searching for:', searchTerm);
            });
        }
    }

    // Handle window resize
    function handleResize() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
        }
    }

    // Animate stats cards on load
    function animateStats() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            }, index * 100);
        });
    }

    // Initialize charts (placeholder for future implementation)
    function initializeCharts() {
        // This would be where you'd initialize Chart.js or other charting libraries
        console.log('Charts would be initialized here');
    }

    // Handle form submissions
    function handleFormSubmissions() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                // Handle form submission
                console.log('Form submitted');
            });
        });
    }

    // Initialize tooltips
    function initializeTooltips() {
        const elementsWithTooltips = document.querySelectorAll('[title]');
        elementsWithTooltips.forEach(element => {
            element.addEventListener('mouseenter', function() {
                // Show tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.getAttribute('title');
                document.body.appendChild(tooltip);
                
                // Position tooltip
                const rect = this.getBoundingClientRect();
                tooltip.style.position = 'absolute';
                tooltip.style.top = rect.bottom + 10 + 'px';
                tooltip.style.left = rect.left + 'px';
                tooltip.style.background = '#2c3e50';
                tooltip.style.color = 'white';
                tooltip.style.padding = '5px 10px';
                tooltip.style.borderRadius = '4px';
                tooltip.style.fontSize = '12px';
                tooltip.style.zIndex = '1000';
                
                this._tooltip = tooltip;
            });
            
            element.addEventListener('mouseleave', function() {
                if (this._tooltip) {
                    document.body.removeChild(this._tooltip);
                    this._tooltip = null;
                }
            });
        });
    }

    // Event listeners
    if (logoToggle) {
        logoToggle.addEventListener('click', toggleSidebar);
    }

    if (sidebarExpandBtn) {
        sidebarExpandBtn.addEventListener('click', toggleSidebar);
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Menu item click handlers
    menuItems.forEach(item => {
        item.addEventListener('click', handleMenuClick);
    });

    // Tab button click handlers
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });

    // Logout button handler
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Logout modal handlers
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const logoutModalOverlay = document.getElementById('logoutModalOverlay');
    
    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', hideLogoutModal);
    }
    
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', performLogout);
    }
    
    // Close modal when clicking overlay background
    if (logoutModalOverlay) {
        logoutModalOverlay.addEventListener('click', function(e) {
            if (e.target === logoutModalOverlay) {
                hideLogoutModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('logoutModalOverlay');
            if (modal && modal.style.display === 'flex') {
                hideLogoutModal();
            }
        }
    });

    // Window resize handler
    window.addEventListener('resize', handleResize);

    // Initialize everything
    loadSidebarState();
    loadPageState();
    initializeNotifications();
    initializeSearch();
    animateStats();
    initializeCharts();
    handleFormSubmissions();
    initializeTooltips();

    // Auto-refresh data every 30 seconds (placeholder)
    setInterval(() => {
        console.log('Auto-refreshing data...');
        // This would refresh dashboard data
    }, 30000);

    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Dark mode toggle (future feature)
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    // Load dark mode preference
    function loadDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    // Real-time updates simulation
    function simulateRealTimeUpdates() {
        const notificationCount = document.querySelector('.notification-count');
        const messageBadge = document.querySelector('.notification-badge');
        
        setInterval(() => {
            // Simulate new notifications
            if (Math.random() > 0.8) {
                if (notificationCount) {
                    let count = parseInt(notificationCount.textContent) || 0;
                    notificationCount.textContent = count + 1;
                }
                if (messageBadge) {
                    let count = parseInt(messageBadge.textContent) || 0;
                    messageBadge.textContent = count + 1;
                }
            }
        }, 10000); // Check every 10 seconds
    }

    // Initialize real-time updates
    simulateRealTimeUpdates();

    // Performance monitoring
    function trackPerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Page loaded in ${loadTime}ms`);
            });
        }
    }

    trackPerformance();

    // Settings Management Functions
    async function loadSettingsData() {
        try {
            // Load current user profile
            await loadCurrentUserProfile();
            
            // Load all admin users
            await loadAdminUsers();
            
            // Load system settings
            await loadSystemSettings();
            
        } catch (error) {
            console.error('Error loading settings data:', error);
        }
    }

    async function loadCurrentUserProfile() {
        try {
            const result = await getUserProfile();
            if (result.success) {
                const data = result.data;
                
                // Update profile form with enhanced Google data
                const displayName = data.displayName || (data.firstName && data.lastName ? data.firstName + ' ' + data.lastName : '') || data.email.split('@')[0];
                document.getElementById('currentUserDisplayName').textContent = displayName;
                document.getElementById('currentUserEmail').textContent = data.email;
                document.getElementById('firstName').value = data.firstName || '';
                document.getElementById('lastName').value = data.lastName || '';
                document.getElementById('displayName').value = data.displayName || '';
                document.getElementById('phone').value = data.phone || data.googleProfile?.phoneNumber || '';
                document.getElementById('department').value = data.department || 'management';
                document.getElementById('bio').value = data.bio || '';
                
                // Update avatar and badges
                updateAvatar(data);
                updateProfileBadges(data);
                
                // Show profile completion status
                if (!data.profileComplete) {
                    showProfileCompletionPrompt(data);
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    async function loadAdminUsers() {
        const loadingElement = document.querySelector('.loading-users');
        const tableBody = document.getElementById('usersTableBody');
        
        try {
            const result = await getAllAdminUsers();
            if (result.success) {
                const users = result.data;
                
                // Update stats
                updateUserStats(users);
                
                // Clear loading and populate table
                tableBody.innerHTML = '';
                
                if (users.length === 0) {
                    tableBody.innerHTML = '<div class="loading-users">No admin users found</div>';
                    return;
                }
                
                users.forEach(user => {
                    const userRow = createUserRow(user);
                    tableBody.appendChild(userRow);
                });
                
            } else {
                tableBody.innerHTML = '<div class="loading-users">Error loading users</div>';
            }
        } catch (error) {
            console.error('Error loading admin users:', error);
            tableBody.innerHTML = '<div class="loading-users">Error loading users</div>';
        }
    }

    function updateUserStats(users) {
        const totalAdmins = users.length;
        const activeAdmins = users.filter(u => u.status === 'active').length;
        const inactiveAdmins = totalAdmins - activeAdmins;
        
        document.getElementById('totalAdmins').textContent = totalAdmins;
        document.getElementById('activeAdmins').textContent = activeAdmins;
        document.getElementById('inactiveAdmins').textContent = inactiveAdmins;
    }

    function createUserRow(user) {
        const row = document.createElement('div');
        row.className = 'table-row';
        
        const lastLogin = user.lastLogin ? 
            new Date(user.lastLogin.seconds * 1000).toLocaleDateString() : 
            'Never';
            
        const initials = user.displayName ? 
            user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() :
            user.email[0].toUpperCase();
        
        row.innerHTML = `
            <div class="table-cell">
                <div class="user-info">
                    <div class="user-avatar-small">
                        ${user.photoURL ? `<img src="${user.photoURL}" alt="Avatar">` : initials}
                    </div>
                    <div class="user-details">
                        <h6>${user.displayName || 'No Name'}</h6>
                        <p>${user.department || 'No Department'}</p>
                    </div>
                </div>
            </div>
            <div class="table-cell">${user.email}</div>
            <div class="table-cell">
                <span class="status-badge ${user.status || 'active'}">${user.status || 'active'}</span>
            </div>
            <div class="table-cell">${lastLogin}</div>
            <div class="table-cell">
                <div class="user-actions">
                    <button class="btn-icon-small btn-warning" onclick="toggleUserStatus('${user.uid}', '${user.status}')">
                        <i class="fas ${user.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
                    </button>
                    <button class="btn-icon-small btn-danger" onclick="confirmDeleteUser('${user.uid}', '${user.email}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        return row;
    }

    async function loadSystemSettings() {
        try {
            const result = await getSystemSettings();
            if (result.success) {
                const settings = result.data;
                
                // Update form fields
                document.getElementById('orgName').value = settings.organizationName || '';
                document.getElementById('orgEmail').value = settings.contactEmail || '';
                document.getElementById('maxAdmins').value = settings.maxAdmins || 10;
                document.getElementById('allowRegistration').checked = settings.allowRegistration !== false;
                document.getElementById('requireEmailVerification').checked = settings.requireEmailVerification === true;
            }
        } catch (error) {
            console.error('Error loading system settings:', error);
        }
    }

    function updateAvatar(userData) {
        const avatarPreview = document.getElementById('avatarPreview');
        const removeBtn = document.getElementById('removePhotoBtn');
        
        if (userData.photoURL) {
            avatarPreview.innerHTML = `<img src="${userData.photoURL}" alt="Avatar">`;
            removeBtn.style.display = 'flex';
        } else {
            const initials = userData.displayName ? 
                userData.displayName.split(' ').map(n => n[0]).join('').toUpperCase() :
                userData.email[0].toUpperCase();
            avatarPreview.innerHTML = initials;
            removeBtn.style.display = 'none';
        }
    }

    function updateProfileBadges(userData) {
        const badgesContainer = document.getElementById('profileBadges');
        badgesContainer.innerHTML = '';
        
        // Login method badge
        if (userData.loginMethod === 'google.com') {
            badgesContainer.innerHTML += '<span class="profile-badge google">Google Account</span>';
        } else {
            badgesContainer.innerHTML += '<span class="profile-badge email">Email Account</span>';
        }
        
        // Profile completion badge
        if (userData.profileComplete) {
            badgesContainer.innerHTML += '<span class="profile-badge verified">Profile Complete</span>';
        } else {
            badgesContainer.innerHTML += '<span class="profile-badge incomplete">Profile Incomplete</span>';
        }
        
        // Admin role badge
        badgesContainer.innerHTML += '<span class="profile-badge">Admin</span>';
    }

    function showProfileCompletionPrompt(userData) {
        // Show a subtle notification encouraging profile completion
        const missingFields = [];
        if (!userData.firstName) missingFields.push('First Name');
        if (!userData.lastName) missingFields.push('Last Name');
        if (!userData.phone) missingFields.push('Phone');
        if (!userData.department || userData.department === 'management') missingFields.push('Department');
        
        if (missingFields.length > 0) {
            setTimeout(() => {
                showSettingsSuccess(`Welcome! Please complete your profile by adding: ${missingFields.join(', ')}`);
            }, 2000);
        }
    }

    // Auto-update display name when first/last name changes
    function setupNameAutoUpdate() {
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const displayNameInput = document.getElementById('displayName');
        
        function updateDisplayName() {
            const firstName = firstNameInput.value.trim();
            const lastName = lastNameInput.value.trim();
            
            if (firstName || lastName) {
                displayNameInput.value = `${firstName} ${lastName}`.trim();
            }
        }
        
        firstNameInput.addEventListener('input', updateDisplayName);
        lastNameInput.addEventListener('input', updateDisplayName);
    }

    // Event Listeners for Settings
    
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        submitBtn.disabled = true;
        
        try {
            const profileData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                displayName: document.getElementById('displayName').value,
                phone: document.getElementById('phone').value,
                department: document.getElementById('department').value,
                bio: document.getElementById('bio').value,
                profileComplete: true // Mark as complete when they save
            };
            
            const result = await saveUserProfile(profileData);
            
            if (result.success) {
                showSettingsSuccess('Profile updated successfully!');
                // Reload profile data
                await loadCurrentUserProfile();
            } else {
                showSettingsError('Failed to update profile: ' + result.error);
            }
        } catch (error) {
            showSettingsError('Error updating profile: ' + error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Organization form submission
    document.getElementById('organizationForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;
        
        try {
            const orgData = {
                organizationName: document.getElementById('orgName').value,
                contactEmail: document.getElementById('orgEmail').value,
                maxAdmins: parseInt(document.getElementById('maxAdmins').value)
            };
            
            const result = await updateSystemSettings(orgData);
            
            if (result.success) {
                showSettingsSuccess('Organization settings saved successfully!');
            } else {
                showSettingsError('Failed to save settings: ' + result.error);
            }
        } catch (error) {
            showSettingsError('Error saving settings: ' + error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Security settings
    document.getElementById('saveSecurityBtn').addEventListener('click', async function() {
        const btn = this;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        btn.disabled = true;
        
        try {
            const securityData = {
                allowRegistration: document.getElementById('allowRegistration').checked,
                requireEmailVerification: document.getElementById('requireEmailVerification').checked
            };
            
            const result = await updateSystemSettings(securityData);
            
            if (result.success) {
                showSettingsSuccess('Security settings updated successfully!');
            } else {
                showSettingsError('Failed to update security settings: ' + result.error);
            }
        } catch (error) {
            showSettingsError('Error updating security settings: ' + error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // Refresh users button
    document.getElementById('refreshUsersBtn').addEventListener('click', async function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        await loadAdminUsers();
        this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
    });

    // Profile picture upload
    document.getElementById('uploadPhotoBtn').addEventListener('click', function() {
        document.getElementById('profilePictureInput').click();
    });

    document.getElementById('profilePictureInput').addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showSettingsError('Please select a valid image file');
            return;
        }
        
        // Validate file size (max 5MB - we'll compress it anyway)
        if (file.size > 5 * 1024 * 1024) {
            showSettingsError('Image size must be less than 5MB');
            return;
        }
        
        const uploadBtn = document.getElementById('uploadPhotoBtn');
        const originalContent = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        uploadBtn.disabled = true;
        
        try {
            const result = await uploadProfilePicture(file);
            
            if (result.success) {
                showSettingsSuccess('Profile picture updated successfully!');
                // Update avatar preview
                const avatarPreview = document.getElementById('avatarPreview');
                const removeBtn = document.getElementById('removePhotoBtn');
                avatarPreview.innerHTML = `<img src="${result.photoURL}" alt="Avatar">`;
                removeBtn.style.display = 'flex';
                
                // Update all avatars in the interface
                const currentUser = auth.currentUser;
                if (currentUser) {
                    await updateUserAvatars(currentUser);
                }
            } else {
                showSettingsError('Failed to upload profile picture: ' + result.error);
            }
        } catch (error) {
            showSettingsError('Error uploading profile picture: ' + error.message);
        } finally {
            uploadBtn.innerHTML = originalContent;
            uploadBtn.disabled = false;
            // Clear the input
            e.target.value = '';
        }
    });

    // Remove profile picture
    document.getElementById('removePhotoBtn').addEventListener('click', async function() {
        if (confirm('Are you sure you want to remove your profile picture?')) {
            const btn = this;
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;
            
            try {
                const result = await saveUserProfile({ photoURL: null, customPhotoURL: null });
                
                if (result.success) {
                    showSettingsSuccess('Profile picture removed successfully!');
                    // Update avatar preview to initials
                    await loadCurrentUserProfile();
                    
                    // Update all avatars in the interface
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                        await updateUserAvatars(currentUser);
                    }
                } else {
                    showSettingsError('Failed to remove profile picture: ' + result.error);
                }
            } catch (error) {
                showSettingsError('Error removing profile picture: ' + error.message);
            } finally {
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }
        }
    });

    // Global functions for user management (needed for onclick handlers)
    window.toggleUserStatus = async function(userId, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        
        if (confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`)) {
            try {
                const result = await updateUserStatus(userId, newStatus);
                if (result.success) {
                    showSettingsSuccess(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
                    await loadAdminUsers();
                } else {
                    showSettingsError('Failed to update user status: ' + result.error);
                }
            } catch (error) {
                showSettingsError('Error updating user status: ' + error.message);
            }
        }
    };

    window.confirmDeleteUser = function(userId, email) {
        if (confirm(`Are you sure you want to delete user: ${email}?\n\nThis action cannot be undone.`)) {
            deleteUser(userId);
        }
    };

    async function deleteUser(userId) {
        try {
            const result = await deleteAdminUser(userId);
            if (result.success) {
                showSettingsSuccess('User deleted successfully!');
                await loadAdminUsers();
            } else {
                showSettingsError('Failed to delete user: ' + result.error);
            }
        } catch (error) {
            showSettingsError('Error deleting user: ' + error.message);
        }
    }

    function showSettingsSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'settings-notification success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    function showSettingsError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'settings-notification error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;  
            top: 20px;
            right: 20px;
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Password Change Form Handler
    document.getElementById('passwordChangeForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (newPassword.length < 6) {
            showSettingsError('New password must be at least 6 characters long');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showSettingsError('New passwords do not match');
            return;
        }
        
        if (currentPassword === newPassword) {
            showSettingsError('New password must be different from current password');
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
        submitBtn.disabled = true;
        
        try {
            const result = await changePassword(currentPassword, newPassword);
            
            if (result.success) {
                showSettingsSuccess('Password changed successfully!');
                // Clear form
                document.getElementById('passwordChangeForm').reset();
            } else {
                let errorMsg = 'Failed to change password: ' + result.error;
                
                if (result.error.includes('wrong-password')) {
                    errorMsg = 'Current password is incorrect';
                } else if (result.error.includes('weak-password')) {
                    errorMsg = 'New password is too weak';
                } else if (result.error.includes('requires-recent-login')) {
                    errorMsg = 'Please log out and log in again before changing your password';
                }
                
                showSettingsError(errorMsg);
            }
        } catch (error) {
            showSettingsError('Error changing password: ' + error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Password Toggle Functionality
    function setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    // Initialize enhanced profile features
    setupNameAutoUpdate();
    setupPasswordToggles();
    
    console.log('JOTAR Admin Dashboard initialized successfully!');
});