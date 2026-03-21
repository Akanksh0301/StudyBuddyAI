/**
 * StudyBuddy XP System
 * Reads XP from localStorage and dynamically updates the sidebar profile on every page.
 */
(function() {
    const XP_PER_LEVEL = 500;
    const LEVEL_TITLES = [
        'Beginner', 'Learner', 'Explorer', 'Apprentice', 'Scholar',
        'Thinker', 'Strategist', 'Analyst', 'Innovator', 'Specialist',
        'Expert', 'Architect', 'Master', 'Visionary', 'Legend'
    ];

    function getXPData() {
        const totalXP = parseInt(localStorage.getItem('studybuddy_xp') || '0');
        const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
        const xpInLevel = totalXP % XP_PER_LEVEL;
        const xpToNext = XP_PER_LEVEL - xpInLevel;
        const titleIdx = Math.min(level - 1, LEVEL_TITLES.length - 1);
        const title = LEVEL_TITLES[titleIdx];
        return { totalXP, level, xpToNext, title };
    }

    function updateSidebar() {
        const data = getXPData();
        const levelEl = document.getElementById('sidebar-level');
        const xpEl = document.getElementById('sidebar-xp');

        if (levelEl) levelEl.textContent = `Level ${data.level} ${data.title}`;
        if (xpEl) xpEl.textContent = `Total XP: ${data.totalXP}`;

        // Also update Progress page mastery section if present
        const mLevel = document.getElementById('mastery-level');
        const mXp = document.getElementById('mastery-xp');
        const mProgress = document.getElementById('mastery-progress');

        if (mLevel) mLevel.textContent = `Level ${data.level}`;
        if (mXp) mXp.textContent = `${data.totalXP % XP_PER_LEVEL} / ${XP_PER_LEVEL} XP`;
        if (mProgress) {
            const percent = ((data.totalXP % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
            mProgress.style.width = `${percent}%`;
        }

        // Also update Analytics page total XP if present
        const analyticsXp = document.getElementById('analytics-total-xp');
        if (analyticsXp) {
            analyticsXp.textContent = data.totalXP.toLocaleString();
        }

        // Also update Achievements page info if present
        const achLevel = document.getElementById('achievements-level');
        const achXp = document.getElementById('achievements-total-xp');
        if (achLevel) achLevel.textContent = `Level ${data.level}`;
        if (achXp) achXp.textContent = data.totalXP.toLocaleString();

        // Also update Dashboard page info if present
        const dXp = document.getElementById('dashboard-total-xp');
        const dLevel = document.getElementById('dashboard-level');
        const dProgress = document.getElementById('dashboard-progress');
        if (dXp) dXp.textContent = data.totalXP.toLocaleString();
        if (dLevel) dLevel.textContent = `Lvl ${data.level}`;
        if (dProgress) {
            const percent = ((data.totalXP % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
            dProgress.style.width = `${percent}%`;
        }
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateSidebar);
    } else {
        updateSidebar();
    }

    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'studybuddy_xp') updateSidebar();
    });

    // Expose globally so quiz_logic.js can call it after awarding XP
    window.updateSidebarXP = updateSidebar;
})();
