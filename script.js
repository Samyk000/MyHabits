// DOM Elements
        const addHabitBtn = document.getElementById('add-habit-btn');
        const addFirstHabitBtn = document.getElementById('add-first-habit');
        const habitModal = document.getElementById('habit-modal');
        const closeModalBtn = document.getElementById('close-modal');
        const cancelHabitBtn = document.getElementById('cancel-habit');
        const habitForm = document.getElementById('habit-form');
        const habitsContainer = document.getElementById('habits-container');
        const emptyState = document.getElementById('empty-state');
        const filterHabits = document.getElementById('filter-habits');
        const toast = document.getElementById('toast');
        const currentStreakEl = document.getElementById('current-streak');
        const habitsCountEl = document.getElementById('habits-count');
        const logo = document.getElementById('logo');
        const exportBtn = document.getElementById('export-btn');
        const themeToggle = document.getElementById('theme-toggle');

        // Habit Data
        let habits = JSON.parse(localStorage.getItem('habits')) || [];
        let editingHabitId = null;

        // Initialize the app
        function init() {
            initTheme();
            renderHabits();
            updateStats();
            initCharts();
            setupEventListeners();
            animateLogo();
        }

        // Set up event listeners
        function setupEventListeners() {
            addHabitBtn.addEventListener('click', openAddHabitModal);
            addFirstHabitBtn.addEventListener('click', openAddHabitModal);
            closeModalBtn.addEventListener('click', closeModal);
            cancelHabitBtn.addEventListener('click', closeModal);
            habitForm.addEventListener('submit', handleFormSubmit);
            filterHabits.addEventListener('change', renderHabits);
            exportBtn.addEventListener('click', exportHabits);
            
            // Logo animation on hover
            logo.addEventListener('mouseenter', () => {
                anime({
                    targets: '.logo-icon',
                    scale: [1, 1.1],
                    rotate: [0, 10, -10, 0],
                    duration: 800,
                    easing: 'easeInOutSine'
                });
            });
        }

        // Animate logo on load
        function animateLogo() {
            anime({
                targets: '.logo-icon',
                scale: [0.8, 1],
                rotate: [-30, 0],
                opacity: [0, 1],
                duration: 800,
                easing: 'easeOutElastic(1, .8)'
            });
            
            anime({
                targets: '.logo-text',
                opacity: [0, 1],
                translateX: [-20, 0],
                duration: 600,
                delay: 200,
                easing: 'easeOutExpo'
            });
        }

        // Open modal for adding a new habit
        function openAddHabitModal() {
            editingHabitId = null;
            document.getElementById('modal-title').textContent = 'Add New Habit';
            document.getElementById('habit-id').value = '';
            document.getElementById('habit-name').value = '';
            document.getElementById('habit-description').value = '';
            document.getElementById('habit-frequency').value = 'daily';
            document.getElementById('habit-goal').value = '30';
            habitModal.classList.add('active');
            
            // Focus on name field
            setTimeout(() => {
                document.getElementById('habit-name').focus();
            }, 100);
            
            // Animate modal appearance
            anime({
                targets: '.modal-content',
                opacity: [0, 1],
                scale: [0.9, 1],
                duration: 300,
                easing: 'easeOutExpo'
            });
        }

        // Open modal for editing an existing habit
        function openEditHabitModal(habitId) {
            const habit = habits.find(h => h.id === habitId);
            if (!habit) return;
            
            editingHabitId = habitId;
            document.getElementById('modal-title').textContent = 'Edit Habit';
            document.getElementById('habit-id').value = habit.id;
            document.getElementById('habit-name').value = habit.name;
            document.getElementById('habit-description').value = habit.description || '';
            document.getElementById('habit-frequency').value = habit.frequency;
            document.getElementById('habit-goal').value = habit.goal;
            habitModal.classList.add('active');
            
            // Focus on name field
            setTimeout(() => {
                document.getElementById('habit-name').focus();
            }, 100);
            
            // Animate modal appearance
            anime({
                targets: '.modal-content',
                opacity: [0, 1],
                scale: [0.9, 1],
                duration: 300,
                easing: 'easeOutExpo'
            });
        }

        // Close modal
        function closeModal() {
            anime({
                targets: '.modal-content',
                opacity: [1, 0],
                scale: [1, 0.9],
                duration: 200,
                easing: 'easeInExpo',
                complete: () => {
                    habitModal.classList.remove('active');
                }
            });
        }

        // Handle form submission
        function handleFormSubmit(e) {
            e.preventDefault();
            
            const name = document.getElementById('habit-name').value.trim();
            const description = document.getElementById('habit-description').value.trim();
            const frequency = document.getElementById('habit-frequency').value;
            const goal = parseInt(document.getElementById('habit-goal').value);
            
            if (!name) {
                showToast('Please enter a habit name', 'error');
                return;
            }
            
            const habitData = {
                name,
                description,
                frequency,
                goal,
                progress: 0,
                streak: 0,
                lastCompleted: null,
                createdAt: new Date().toISOString(),
                completedDates: []
            };
            
            if (editingHabitId) {
                // Update existing habit
                const index = habits.findIndex(h => h.id === editingHabitId);
                if (index !== -1) {
                    // Preserve existing progress data
                    habitData.progress = habits[index].progress;
                    habitData.streak = habits[index].streak;
                    habitData.lastCompleted = habits[index].lastCompleted;
                    habitData.completedDates = habits[index].completedDates;
                    habitData.createdAt = habits[index].createdAt;
                    
                    habits[index] = { ...habits[index], ...habitData };
                    showToast('Habit updated successfully!');
                }
            } else {
                // Add new habit
                habitData.id = Date.now().toString();
                habits.unshift(habitData);
                showToast('Habit added successfully!');
                
                // Animate the new habit card
                setTimeout(() => {
                    const newHabitCard = document.querySelector(`[data-habit-id="${habitData.id}"]`);
                    if (newHabitCard) {
                        anime({
                            targets: newHabitCard,
                            scale: [0.9, 1],
                            opacity: [0, 1],
                            duration: 600,
                            easing: 'easeOutElastic(1, .8)'
                        });
                    }
                }, 100);
            }
            
            saveHabits();
            closeModal();
            renderHabits();
            updateStats();
            updateCharts();
        }

        // Render habits based on filter
        function renderHabits() {
            const filter = filterHabits.value;
            let filteredHabits = [...habits];
            
            if (filter === 'active') {
                filteredHabits = habits.filter(habit => habit.progress < habit.goal);
            } else if (filter === 'completed') {
                filteredHabits = habits.filter(habit => habit.progress >= habit.goal);
            }
            
            if (filteredHabits.length === 0) {
                emptyState.style.display = 'block';
                habitsContainer.innerHTML = '';
                habitsContainer.appendChild(emptyState);
            } else {
                emptyState.style.display = 'none';
                habitsContainer.innerHTML = '';
                
                filteredHabits.forEach(habit => {
                    const habitCard = createHabitCard(habit);
                    habitsContainer.appendChild(habitCard);
                });
            }
        }

        // Create a habit card element
        function createHabitCard(habit) {
            const progressPercentage = Math.min(100, (habit.progress / habit.goal) * 100);
            const isCompleted = habit.progress >= habit.goal;
            
            const card = document.createElement('div');
            card.className = `habit-card ${isCompleted ? 'completed' : ''}`;
            card.dataset.habitId = habit.id;
            
            card.innerHTML = `
                <div class="habit-header">
                    <h3 class="habit-title">${habit.name}</h3>
                    <div class="habit-actions">
                        <button class="action-btn edit-btn" title="Edit">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Delete">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
                <div class="habit-details">
                    ${habit.description ? `<p class="habit-description">${habit.description}</p>` : ''}
                    <div class="habit-streak">
                        <i class="ri-fire-fill" style="color: var(--primary)"></i>
                        <span>Current streak: <span class="streak-count">${habit.streak}</span> days</span>
                    </div>
                    <div class="habit-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>${Math.round(progressPercentage)}%</span>
                            <span>${habit.progress}/${habit.goal} days</span>
                        </div>
                    </div>
                </div>
                <div class="habit-footer">
                    <div class="habit-dates">
                        <div>Created: ${formatDate(habit.createdAt)}</div>
                        ${habit.lastCompleted ? `<div>Last completed: ${formatDate(habit.lastCompleted)}</div>` : ''}
                    </div>
                    <button class="check-btn ${isCompleted ? 'checked' : ''}">
                        <i class="ri-check-line"></i> ${isCompleted ? 'Completed' : 'Check'}
                    </button>
                </div>
            `;
            
            // Add event listeners to action buttons
            const editBtn = card.querySelector('.edit-btn');
            const deleteBtn = card.querySelector('.delete-btn');
            const checkBtn = card.querySelector('.check-btn');
            
            editBtn.addEventListener('click', () => openEditHabitModal(habit.id));
            deleteBtn.addEventListener('click', () => deleteHabit(habit.id));
            checkBtn.addEventListener('click', () => toggleHabitCompletion(habit.id));
            
            // Add hover animation
            card.addEventListener('mouseenter', () => {
                anime({
                    targets: card,
                    scale: 1.02,
                    duration: 200,
                    easing: 'easeOutExpo'
                });
            });
            
            card.addEventListener('mouseleave', () => {
                anime({
                    targets: card,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutExpo'
                });
            });
            
            return card;
        }

        // Toggle habit completion status
        function toggleHabitCompletion(habitId) {
            const habit = habits.find(h => h.id === habitId);
            if (!habit) return;
            
            const today = new Date().toISOString().split('T')[0];
            const isCompletedToday = habit.completedDates.includes(today);
            
            if (isCompletedToday) {
                // Already completed today - undo
                habit.completedDates = habit.completedDates.filter(date => date !== today);
                habit.progress = Math.max(0, habit.progress - 1);
                
                // Check if we're breaking a streak
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                if (!habit.completedDates.includes(yesterdayStr)) {
                    habit.streak = 0;
                }
                
                showToast('Habit unchecked', 'warning');
            } else {
                // Mark as completed today
                habit.completedDates.push(today);
                habit.progress = Math.min(habit.goal, habit.progress + 1);
                
                // Update streak
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                if (habit.completedDates.includes(yesterdayStr)) {
                    habit.streak += 1;
                } else {
                    habit.streak = 1;
                }
                
                habit.lastCompleted = new Date().toISOString();
                
                // Show celebration if goal reached
                if (habit.progress === habit.goal) {
                    celebrateCompletion();
                    showToast('Congratulations! Habit goal achieved!', 'success');
                } else {
                    showToast('Habit marked as completed!');
                }
            }
            
            saveHabits();
            renderHabits();
            updateStats();
            updateCharts();
        }

        // Delete a habit
        function deleteHabit(habitId) {
            if (!confirm('Are you sure you want to delete this habit?')) return;
            
            const index = habits.findIndex(h => h.id === habitId);
            if (index === -1) return;
            
            // Animate deletion
            const habitCard = document.querySelector(`[data-habit-id="${habitId}"]`);
            if (habitCard) {
                anime({
                    targets: habitCard,
                    opacity: [1, 0],
                    scale: [1, 0.9],
                    translateX: [0, 20],
                    duration: 300,
                    easing: 'easeInExpo',
                    complete: () => {
                        habits.splice(index, 1);
                        saveHabits();
                        renderHabits();
                        updateStats();
                        updateCharts();
                        showToast('Habit deleted', 'warning');
                    }
                });
            } else {
                habits.splice(index, 1);
                saveHabits();
                renderHabits();
                updateStats();
                updateCharts();
                showToast('Habit deleted', 'warning');
            }
        }

        // Save habits to localStorage
        function saveHabits() {
            localStorage.setItem('habits', JSON.stringify(habits));
        }

        // Update dashboard statistics
        function updateStats() {
            // Current streak (longest streak among all habits)
            const longestStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
            currentStreakEl.textContent = longestStreak;
            
            // Total habits count
            habitsCountEl.textContent = habits.length;
            
            // Animate stat updates
            anime({
                targets: [currentStreakEl, habitsCountEl],
                scale: [1.2, 1],
                duration: 600,
                easing: 'easeOutElastic(1, .8)'
            });
        }

        // Initialize charts
        function initCharts() {
            const habitsCtx = document.getElementById('habits-chart').getContext('2d');
            window.habitsChart = new Chart(habitsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'In Progress'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: [
                            'rgba(5, 150, 105, 0.9)',  // Success color
                            'rgba(109, 40, 217, 0.9)'  // Primary color
                        ],
                        borderColor: [
                            'rgba(5, 150, 105, 1)',
                            'rgba(109, 40, 217, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    cutout: '85%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                color: 'var(--text-color)',
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 13,
                                    weight: '600'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'var(--card-bg)',
                            titleColor: 'var(--text-color)',
                            bodyColor: 'var(--text-color)',
                            borderColor: 'var(--border-color)',
                            borderWidth: 1,
                            padding: 12,
                            boxPadding: 8,
                            cornerRadius: 12,
                            bodyFont: {
                                size: 14
                            }
                        }
                    }
                }
            });
            
            updateCharts();
        }

        // Enhanced updateCharts function
        function updateCharts() {
            const completedCount = habits.filter(h => h.progress >= h.goal).length;
            const inProgressCount = habits.length - completedCount;
            
            // Animate chart update
            anime({
                targets: '.chart-container',
                scale: [0.98, 1],
                duration: 400,
                easing: 'easeOutElastic(1, .8)'
            });

            window.habitsChart.data.datasets[0].data = [completedCount, inProgressCount];
            window.habitsChart.update('active');
        }

        // Show toast notification
        function showToast(message, type = 'success') {
            const toastMessage = document.getElementById('toast-message');
            toastMessage.textContent = message;
            
            // Update toast style based on type
            toast.className = 'toast';
            toast.classList.add(type);
            
            // Show toast
            toast.classList.add('show');
            
            // Hide after delay
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
            
            // Animate appearance
            anime({
                targets: toast,
                translateY: [100, 0],
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutExpo'
            });
        }

        // Celebrate habit completion
        function celebrateCompletion() {
            // Create confetti elements
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = getRandomColor();
                document.body.appendChild(confetti);
                
                anime({
                    targets: confetti,
                    translateY: [0, -Math.random() * 300 - 100],
                    translateX: [0, (Math.random() - 0.5) * 200],
                    rotate: [0, Math.random() * 360],
                    opacity: [1, 0],
                    duration: 2000,
                    easing: 'easeOutExpo',
                    complete: () => {
                        confetti.remove();
                    }
                });
            }
            
            // Logo celebration animation
            anime({
                targets: '.logo-icon',
                scale: [1, 1.2, 1],
                rotate: [0, 360],
                duration: 1000,
                easing: 'easeOutElastic(1, .8)'
            });
        }

        // Get random color for confetti
        function getRandomColor() {
            const colors = [
                '#7c3aed', '#ec4899', '#10b981', '#3b82f6', 
                '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        // Format date for display
        function formatDate(dateString) {
            if (!dateString) return 'Never';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }

        // Export habits data
        function exportHabits() {
            const dataStr = JSON.stringify(habits, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `bloom-habits-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            showToast('Habits exported successfully!');
        }

        // Initialize theme
        function initTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }

        function updateThemeIcon(theme) {
            themeToggle.innerHTML = theme === 'dark' 
                ? '<i class="ri-moon-line"></i>' 
                : '<i class="ri-sun-line"></i>';
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            
            // Animate theme change
            anime({
                targets: themeToggle,
                rotate: [0, 360],
                duration: 600,
                easing: 'easeInOutCubic'
            });
        });

        // Initialize the app
        document.addEventListener('DOMContentLoaded', init);
