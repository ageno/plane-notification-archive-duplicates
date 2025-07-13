let isExtensionEnabled = false; // Variable to store the extension state
const ACTION = 'archive';
const DOMAIN_REGEX = /^https:\/\/plane\.ageno\.work\/?/;
// Deprecated
const ARCHIVE_REGEX = /^https:\/\/plane\.ageno\.work\/[^\/]+\/notifications\/$/;
// Deprecated
const COMMENTS_REGEX = /^https:\/\/plane\.ageno\.work\/([^\/]+)\/(notifications|projects\/[^\/]+)\/.*$/;


// Function to initialize the extension state
function initializeExtensionState() {
    chrome.storage.sync.get(['extensionEnabled'], (result) => {
        isExtensionEnabled = result.extensionEnabled !== undefined ? result.extensionEnabled : false;
        console.log('Plane Notification Extension enabled state on init:', isExtensionEnabled);

        // Start observing mutations after initializing the state
        startObserving();
        
        // Call filterGroups initially to apply filtering based on the state
        // filterGroups();
    });
}

// Function to start observing DOM mutations
function startObserving() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length && isExtensionEnabled) {
                if (DOMAIN_REGEX.test(window.location.href)) {
                    actionButton();

                    // Only call filterGroups if the extension is enabled
                    // filterGroups();
                    
                    adjustActivityLayout();
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true, subtree: true
    });
}

function actionButton() {
    // Define the custom ID for the button
    const buttonId = 'plane-notification-extension-button';

    // Check if the button with the specified ID already exists
    const existingButton = document.getElementById(buttonId);

    // If the button doesn't exist, create and append it
    if (!existingButton) {
        // Select the target element using the class names
        const targetElement = document.querySelector('.relative.flex.justify-center.items-center.gap-2.text-sm');

        // Create a new button element
        const button = document.createElement('button');

        // Set button properties
        button.textContent = 'Archive Duplicates';  // Button text
        button.className = 'text-custom-primary-100 bg-transparent border border-custom-primary-100 hover:bg-custom-primary-100/20 focus:text-custom-primary-100 focus:bg-custom-primary-100/30 px-3 py-1.5 font-medium text-xs rounded flex items-center gap-1.5 whitespace-nowrap transition-all justify-center hover:!bg-custom-primary-100/20';  // Tailwind CSS classes
        button.id = buttonId;  // Set custom ID for the button

        // Append the button to the target element
        targetElement?.insertBefore(button, targetElement.firstChild);

        button.addEventListener('click', () => {
            const userConfirmed = confirm('Are you sure you want to archive duplicates?'); // Confirmation dialog

            if (userConfirmed) {
                console.log('User confirmed, filtering groups.');
                filterGroups();  // Call filterGroups on button click if confirmed
            }
        });
    }
}

// New method to handle group action
function handleGroupAction(group) {
    const buttonToClick = group.querySelector('.group-hover\\:block button:nth-child(2)');

    if (ACTION === 'archive' && buttonToClick) {
        buttonToClick.click(); // Trigger the click on the button
        const lineClampElement = group.querySelector('.text-custom-text-200 .line-clamp-1');
        if (lineClampElement) {
            const archivedText = lineClampElement.textContent.trim();
            console.log('Archived group:', archivedText); // Log the archived group's text
        }
    } else if (ACTION === 'remove') {
        group.remove(); // Remove the group from the DOM
    }
}

// Your existing filterGroups function
function filterGroups() {

    const groups = document.querySelectorAll('main > div > div:first-child div.group');

    // Create a Map to track seen texts and their corresponding groups
    const seenTextsMap = new Map();

    groups.forEach(group => {
        const lineClampElement = group.querySelector('.text-custom-text-200 .line-clamp-1');

        if (lineClampElement) {
            // Get the full text content and split it by `&nbsp;` to only use the part before it
            const fullText = lineClampElement.textContent.trim();
            const textBeforeNbsp = fullText.split('\u00a0')[0]; // Split by non-breaking space (&nbsp;)

            const hasPrimaryClass = group.classList.contains('bg-custom-primary-100/5');

            if (seenTextsMap.has(textBeforeNbsp)) {
                const existingGroup = seenTextsMap.get(textBeforeNbsp);

                if (hasPrimaryClass) {
                    // If current group has the primary class, remove the existing group without the class
                    if (!existingGroup.classList.contains('bg-custom-primary-100/5')) {
                        handleGroupAction(existingGroup);
                        seenTextsMap.set(textBeforeNbsp, group); // Keep the primary class group
                    } else {
                        handleGroupAction(group); // If both have the class, remove the duplicate
                    }
                } else {
                    // If current group does not have the primary class and a group with the text exists, remove it
                    handleGroupAction(group);
                }
            } else {
                // If this is the first occurrence, store the group
                seenTextsMap.set(textBeforeNbsp, group);
            }
        }
    });
}

function adjustActivityLayout() {
    const commentsWrapperSection = document.querySelector('.relative.h-full.w-full.overflow-hidden .space-y-4.pt-3 .min-h-\\[200px\\] .space-y-3');
    if (commentsWrapperSection){
        const isDescOrder = localStorage.getItem('activity_sort_order') === '"desc"';

        const commentInputSection = commentsWrapperSection.querySelector('.sticky.z-\\[4\\].bg-custom-background-100.sm\\:static');

        if (commentInputSection) {
            commentsWrapperSection.classList.toggle('flex', isDescOrder);
            commentsWrapperSection.classList.toggle('flex-col-reverse', isDescOrder);
            commentInputSection.style.marginBottom = isDescOrder ? '32px' : 'initial';
        }
    };
}

// Initialize the extension state on script load
initializeExtensionState();
