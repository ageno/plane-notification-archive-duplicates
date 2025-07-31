export function generateTaskDescription() {
    const buttonId = 'pne-button-apply-template';
    const buttonEditorId = `${buttonId}-editor`
    const buttonModalId = `${buttonId}-modal`
    const modalContentSelector = document.querySelector('div#editor-container-issue-modal-editor div[contenteditable="true"]');
    const modalContentWrapperSelector = document.querySelector('div#editor-container-issue-modal-editor');
    const contentWrapperSelector = document.querySelector('.editor-container.cursor-text.large-font.sans-serif.w-full.max-w-full.relative.pl-3.-ml-3.border-none');
    const contentSelector = contentWrapperSelector?.querySelector('div[contenteditable="true"]');
    const modalContentWrapper = modalContentWrapperSelector?.closest('.border-custom-border-200.rounded-lg.relative');

    if (modalContentWrapper?.parentNode && !modalContentWrapper.parentNode.querySelector(`#${buttonModalId}`)) {
        const modalButton = createTemplateButton(buttonModalId);

        modalContentWrapper.parentNode.appendChild(modalButton);
        attachButtonHandler(modalButton, modalContentSelector);
    }

    if (contentWrapperSelector && !contentWrapperSelector.querySelector(`#${buttonEditorId}`)) {
        const editorButton = createTemplateButton(buttonEditorId);

        contentWrapperSelector.appendChild(editorButton);
        attachButtonHandler(editorButton, contentSelector);
    }

    function createTemplateButton(id) {
        const button = document.createElement('button');
        button.textContent = 'Apply Template';
        button.className = 'text-custom-primary-100 bg-transparent border border-custom-primary-100 hover:bg-custom-primary-100/20 focus:text-custom-primary-100 focus:bg-custom-primary-100/30 px-3 py-1.5 font-medium text-xs rounded flex items-center gap-1.5 whitespace-nowrap transition-all justify-center hover:!bg-custom-primary-100/20';
        button.id = id;
        button.type = 'button';
        button.style.marginTop = '8px';
        button.style.justifySelf = 'flex-end';
        return button;
    }

    function attachButtonHandler(button, targetContent) {
        button.addEventListener('click', () => {
            const userConfirmed = confirm('Apply predefined task description.');
            if (userConfirmed) {
                console.log('User confirmed, fetching template...');

                fetch(chrome.runtime.getURL('template.html'))
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch template.html');
                        }
                        return response.text();
                    })
                    .then(templateHTML => {
                        if (targetContent) {
                            targetContent.innerHTML = templateHTML;
                        }
                    })
                    .catch(err => {
                        console.error('Template fetch error:', err);
                    });
            }
        });
    }
}
