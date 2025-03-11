// Cache for notifications data
const notificationsCache = new Map();

// Function for getting data from cache or API
const getNotificationsData = async (slug) => {
    // Check if data is in cache and not older than 30 seconds
    const cachedData = notificationsCache.get(slug);
    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp) < 30 * 1000) {
        return cachedData.data;
    }

    // If not in cache or data is old, fetch from API
    try {
        const response = await fetch(`/api/workspaces/${slug}/users/notifications/unread/`);
        const data = await response.json();

        // Save in cache with timestamp
        notificationsCache.set(slug, {
            data: data,
            timestamp: now
        });

        return data;
    } catch (error) {
        console.error(`Error fetching notifications for ${slug}:`, error);
        return null;
    }
};

// Function for adding counters
const addNotificationCounters = (element, mentionsCount, notificationsCount) => {
    const container = element.querySelector('.flex.items-center.justify-between');
    const existingCounters = container.querySelector('.ml-auto');

    // Remove existing counters if present
    if (existingCounters) {
        existingCounters.remove();
    }

    // Counters container
    const countersDiv = document.createElement('div');
    countersDiv.className = 'ml-auto flex items-center gap-2';

    // Mentions counter (@)
    if (mentionsCount > 0) {
        const mentionsDiv = document.createElement('div');
        mentionsDiv.className = 'relative flex justify-center items-center px-2.5 py-0.5 flex-shrink-0 bg-custom-primary-100/20 text-custom-primary-100 text-xs font-semibold rounded-xl';
        mentionsDiv.textContent = `@ ${mentionsCount}`;
        countersDiv.appendChild(mentionsDiv);
    }

    // Notifications counter (bell icon)
    if (notificationsCount > 0) {
        const notificationsDiv = document.createElement('div');
        notificationsDiv.className = 'relative flex justify-center items-center px-2.5 py-0.5 flex-shrink-0 bg-custom-sidebar-background-80 text-custom-text-200 text-xs font-semibold rounded-xl';
        notificationsDiv.innerHTML = notificationsCount;
        countersDiv.appendChild(notificationsDiv);
    }

    container.appendChild(countersDiv);
};

// Function to update all workspaces
const updateAllWorkspaces = async () => {
    const workspaceElements = document.querySelectorAll('[role="menu"] > div:first-child a[href^="/"]');
    console.log(workspaceElements);

    // Create an array of promises for all workspaces
    const updatePromises = Array.from(workspaceElements).map(async element => {
        const slug = element.getAttribute('href').replace(/\//g, '');
        if (!slug) return;

        const data = await getNotificationsData(slug);
        if (data) {
            const mentionsCount = data.mention_unread_notifications_count;
            const totalCount = data.total_unread_notifications_count;

            if (mentionsCount > 0 || totalCount > 0) {
                addNotificationCounters(element, mentionsCount, totalCount);
            }
        } else {
            console.warn('No data for slug ' + slug);
        }
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);
};

// Listen for clicks on body
document.querySelector('body').addEventListener('click', function (event) {
    let button = event.target.closest('button');
    if (! button || ! button.classList.contains('group/menu-button')) {
        console.warn('No button', event.target);
        return;
    }

    setTimeout(async function () {
        const state = document.querySelector('.group\\/menu-button').getAttribute('data-headlessui-state');
        if (state != 'open') {
            console.warn('Not open list of workspaces');

            return;
        }

        await updateAllWorkspaces();
    }, 100);
}, false);