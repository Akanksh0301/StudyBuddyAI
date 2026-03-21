document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatThread = document.getElementById('chat-thread');
    const typingIndicator = document.getElementById('typing-indicator');
    const emptyState = document.getElementById('empty-state');
    const chatHistoryList = document.getElementById('chat-history-list');
    const newChatBtn = document.getElementById('new-chat-btn');

    let isFirstMessage = true;
    let emptyStateHtml = emptyState ? emptyState.outerHTML : ''; // Cache the original empty state

    // Find the XP display element in the sidebar
    const xpDisplays = document.querySelectorAll('aside p.text-slate-500');
    let xpDisplay = null;
    xpDisplays.forEach(el => {
        if(el.textContent.includes('XP') || el.textContent.includes('Level')) {
            xpDisplay = el;
        }
    });

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            // Restore empty state
            chatThread.innerHTML = emptyStateHtml;
            isFirstMessage = true;
            
            // Grey out all active history cards
            if (chatHistoryList) {
                const existing = chatHistoryList.querySelectorAll('button');
                existing.forEach(btn => {
                    btn.className = "w-full text-left bg-transparent p-5 rounded-3xl transition-all hover:bg-surface-container-highest/50";
                    const h4 = btn.querySelector('h4');
                    if (h4) {
                       h4.classList.remove('text-primary');
                       h4.classList.add('text-on-surface');
                    }
                });
            }
        });
    }

    function scrollToBottom() {
        const chatContainer = document.querySelector('section.overflow-y-auto');
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight + 100;
    }

    function createHistoryCard(title, preview) {
        if (!chatHistoryList) return;
        
        // Remove active class from existing buttons to grey them out
        const existing = chatHistoryList.querySelectorAll('button');
        existing.forEach(btn => {
            btn.className = "w-full text-left bg-transparent p-5 rounded-3xl transition-all hover:bg-surface-container-highest/50";
            const h4 = btn.querySelector('h4');
            if (h4) {
               h4.classList.remove('text-primary');
               h4.classList.add('text-on-surface');
            }
        });

        // Add the new active card at the top
        const card = document.createElement('button');
        card.className = "w-full text-left bg-primary/5 border border-primary/10 p-5 rounded-3xl transition-all shadow-[0_2px_15px_-3px_rgba(70,72,212,0.05)] hover:bg-primary/10 animate-fade-in";
        card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-headline text-sm font-bold text-primary truncate pr-2">${title}</h4>
          <span class="text-[10px] text-outline font-medium whitespace-nowrap pt-0.5">Just now</span>
        </div>
        <p class="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">${preview}</p>
        `;
        chatHistoryList.prepend(card);
    }

    function addUserMessage(message) {
        const userHtml = `
            <div class="flex flex-col items-end w-full animate-fade-in">
                <div class="flex items-center space-x-3 mb-4">
                    <span class="text-[10px] text-outline">Just now</span>
                    <span class="font-headline text-xs font-bold tracking-wider text-on-surface uppercase">You</span>
                </div>
                <div class="bg-surface-container-highest p-6 rounded-2xl rounded-tr-none max-w-xl shadow-[0px_20px_40px_rgba(70,72,212,0.06)]">
                    <p class="font-body text-base text-on-surface">${message.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `;
        chatThread.insertAdjacentHTML('beforeend', userHtml);
        scrollToBottom();
    }

    function addTutorMessage(data) {
        const stepsHtml = (data.steps || []).map(step => 
            `<li class="mb-2"><span class="mr-2">&bull;</span>${step}</li>`
        ).join('');

        const tutorHtml = `
            <div class="flex flex-col items-start max-w-4xl animate-fade-in">
                <div class="flex items-center space-x-3 mb-4">
                    <div class="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shadow-sm">
                        <span class="material-symbols-outlined text-white text-sm" data-icon="smart_toy" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
                    </div>
                    <span class="font-headline text-xs font-bold tracking-wider text-primary uppercase">StudyBuddy AI</span>
                </div>
                <div class="bg-surface-container-low p-8 rounded-2xl rounded-tl-none w-full">
                    <div class="flex items-start space-x-6">
                        <div class="flex-grow">
                            <ul class="font-body text-lg text-on-surface leading-relaxed mb-6 space-y-2 list-none">
                                ${stepsHtml}
                            </ul>
                            
                            <div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 mb-6">
                                <p class="font-mono text-sm text-primary font-bold mb-2 uppercase tracking-widest">Key Concept</p>
                                <p class="font-body text-base italic text-on-surface-variant">${data.keyConcept || ''}</p>
                            </div>
                            
                            <p class="font-body text-lg text-on-surface leading-relaxed border-l-4 border-secondary/50 pl-4 py-1 italic">
                                Example: ${data.example || ''}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        chatThread.insertAdjacentHTML('beforeend', tutorHtml);
        scrollToBottom();
    }

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';

        if (isFirstMessage) {
            const currentEmptyState = document.getElementById('empty-state');
            if (currentEmptyState) currentEmptyState.remove();
            
            // Extract a rudimentary title
            const words = text.split(' ');
            let title = text;
            if (words.length > 4) title = words.slice(0, 4).join(' ') + '...';
            createHistoryCard(title, text);
            isFirstMessage = false;
        }

        addUserMessage(text);
        
        typingIndicator.classList.remove('hidden');
        scrollToBottom();

        try {
            const res = await fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    topic: 'Any Academic Subject',
                    level: 'University level'
                })
            });

            const responsePlayload = await res.json();
            
            typingIndicator.classList.add('hidden');
            
            if (responsePlayload.response) {
                addTutorMessage(responsePlayload.response);
            } else {
                addTutorMessage({ steps: ["Sorry, I couldn't generate a proper response."], example: "", keyConcept: "" });
            }

            // Update XP
            if (responsePlayload.updated_xp && xpDisplay) {
                xpDisplay.textContent = `${responsePlayload.updated_xp} Total XP`;
                xpDisplay.classList.add('text-secondary', 'font-bold');
                setTimeout(() => xpDisplay.classList.remove('text-secondary', 'font-bold'), 2000);
            }

        } catch (e) {
            console.error('Chat error:', e);
            typingIndicator.classList.add('hidden');
            addTutorMessage({ steps: ["Network error. Is the backend running?"], example: "", keyConcept: "" });
        }
    }

    // --- Suggested Cards Handler ---
    const setupCardListeners = () => {
        const cards = document.querySelectorAll('#empty-state button');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.querySelector('p')?.textContent;
                if (prompt) {
                    chatInput.value = prompt;
                    handleSend();
                }
            });
        });
    };
    setupCardListeners();

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
});
