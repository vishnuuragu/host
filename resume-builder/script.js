document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const fullNameInput = document.getElementById('full-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const locationInput = document.getElementById('location');
    const summaryInput = document.getElementById('summary');
    const skillInput = document.getElementById('skill-input');
    
    // Lists
    const experienceList = document.getElementById('experience-list');
    const educationList = document.getElementById('education-list');
    const skillsList = document.getElementById('skills-list');
    
    // Buttons
    const addExperienceBtn = document.getElementById('add-experience');
    const addEducationBtn = document.getElementById('add-education');
    const previewBtn = document.getElementById('preview-btn');
    const downloadBtn = document.getElementById('download-btn');
    const saveBtn = document.getElementById('save-btn');
    
    // Preview elements
    const previewName = document.getElementById('preview-name');
    const previewEmail = document.getElementById('preview-email');
    const previewPhone = document.getElementById('preview-phone');
    const previewLocation = document.getElementById('preview-location');
    const previewSummary = document.getElementById('preview-summary');
    const previewExperience = document.getElementById('preview-experience');
    const previewEducation = document.getElementById('preview-education');
    const previewSkills = document.getElementById('preview-skills');
    
    const savedList = document.getElementById('saved-list');

    // Data storage
    let experiences = [];
    let educations = [];
    let skills = [];
    let savedResumes = JSON.parse(localStorage.getItem('resumes')) || [];

    // Personal info event listeners
    fullNameInput.addEventListener('input', updatePreview);
    emailInput.addEventListener('input', updatePreview);
    phoneInput.addEventListener('input', updatePreview);
    locationInput.addEventListener('input', updatePreview);
    summaryInput.addEventListener('input', updatePreview);

    // Add experience
    addExperienceBtn.addEventListener('click', () => {
        const experienceDiv = document.createElement('div');
        experienceDiv.className = 'experience-item';
        experienceDiv.innerHTML = `
            <div class="form-row">
                <input type="text" placeholder="Job Title" class="job-title" />
                <input type="text" placeholder="Company" class="company" />
            </div>
            <div class="form-row">
                <input type="text" placeholder="Start Date" class="start-date" />
                <input type="text" placeholder="End Date" class="end-date" />
            </div>
            <textarea placeholder="Job Description" class="job-description"></textarea>
            <button class="remove-btn">Remove</button>
        `;
        
        experienceList.appendChild(experienceDiv);
        
        // Add event listeners to new inputs
        experienceDiv.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updateExperience);
        });
        
        experienceDiv.querySelector('.remove-btn').addEventListener('click', () => {
            experienceDiv.remove();
            updateExperience();
        });
        
        updateExperience();
    });

    // Add education
    addEducationBtn.addEventListener('click', () => {
        const educationDiv = document.createElement('div');
        educationDiv.className = 'education-item';
        educationDiv.innerHTML = `
            <div class="form-row">
                <input type="text" placeholder="Degree" class="degree" />
                <input type="text" placeholder="Institution" class="institution" />
            </div>
            <div class="form-row">
                <input type="text" placeholder="Year" class="year" />
                <input type="text" placeholder="GPA (optional)" class="gpa" />
            </div>
            <button class="remove-btn">Remove</button>
        `;
        
        educationList.appendChild(educationDiv);
        
        // Add event listeners to new inputs
        educationDiv.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updateEducation);
        });
        
        educationDiv.querySelector('.remove-btn').addEventListener('click', () => {
            educationDiv.remove();
            updateEducation();
        });
        
        updateEducation();
    });

    // Skills input
    skillInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && skillInput.value.trim()) {
            const skill = skillInput.value.trim();
            if (!skills.includes(skill)) {
                skills.push(skill);
                skillInput.value = '';
                updateSkills();
                updatePreview();
            }
        }
    });

    function updateExperience() {
        experiences = Array.from(experienceList.querySelectorAll('.experience-item')).map(item => ({
            jobTitle: item.querySelector('.job-title').value,
            company: item.querySelector('.company').value,
            startDate: item.querySelector('.start-date').value,
            endDate: item.querySelector('.end-date').value,
            description: item.querySelector('.job-description').value
        }));
        updatePreview();
    }

    function updateEducation() {
        educations = Array.from(educationList.querySelectorAll('.education-item')).map(item => ({
            degree: item.querySelector('.degree').value,
            institution: item.querySelector('.institution').value,
            year: item.querySelector('.year').value,
            gpa: item.querySelector('.gpa').value
        }));
        updatePreview();
    }

    function updateSkills() {
        skillsList.innerHTML = '';
        skills.forEach(skill => {
            const skillSpan = document.createElement('span');
            skillSpan.className = 'skill-tag';
            skillSpan.innerHTML = `
                ${skill}
                <button class="remove-skill" data-skill="${skill}">×</button>
            `;
            skillsList.appendChild(skillSpan);
        });

        // Add remove listeners
        skillsList.querySelectorAll('.remove-skill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillToRemove = e.target.dataset.skill;
                skills = skills.filter(skill => skill !== skillToRemove);
                updateSkills();
                updatePreview();
            });
        });
    }

    function updatePreview() {
        // Personal info
        previewName.textContent = fullNameInput.value || 'Your Name';
        previewEmail.textContent = emailInput.value || 'email@example.com';
        previewPhone.textContent = phoneInput.value || '+1 (555) 123-4567';
        previewLocation.textContent = locationInput.value || 'City, State';
        previewSummary.textContent = summaryInput.value || 'Your professional summary will appear here...';

        // Experience
        previewExperience.innerHTML = '';
        experiences.forEach(exp => {
            if (exp.jobTitle || exp.company) {
                const expDiv = document.createElement('div');
                expDiv.className = 'experience-entry';
                expDiv.innerHTML = `
                    <div class="exp-header">
                        <h3>${exp.jobTitle || 'Job Title'}</h3>
                        <span class="company">${exp.company || 'Company'}</span>
                    </div>
                    <div class="exp-dates">${exp.startDate || 'Start'} - ${exp.endDate || 'End'}</div>
                    ${exp.description ? `<p class="exp-description">${exp.description}</p>` : ''}
                `;
                previewExperience.appendChild(expDiv);
            }
        });

        // Education
        previewEducation.innerHTML = '';
        educations.forEach(edu => {
            if (edu.degree || edu.institution) {
                const eduDiv = document.createElement('div');
                eduDiv.className = 'education-entry';
                eduDiv.innerHTML = `
                    <div class="edu-header">
                        <h3>${edu.degree || 'Degree'}</h3>
                        <span class="institution">${edu.institution || 'Institution'}</span>
                    </div>
                    <div class="edu-details">
                        ${edu.year ? `<span class="year">${edu.year}</span>` : ''}
                        ${edu.gpa ? `<span class="gpa">GPA: ${edu.gpa}</span>` : ''}
                    </div>
                `;
                previewEducation.appendChild(eduDiv);
            }
        });

        // Skills
        previewSkills.innerHTML = '';
        if (skills.length > 0) {
            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'skills-container';
            skills.forEach(skill => {
                const skillSpan = document.createElement('span');
                skillSpan.className = 'preview-skill';
                skillSpan.textContent = skill;
                skillsContainer.appendChild(skillSpan);
            });
            previewSkills.appendChild(skillsContainer);
        }
    }

    // Save resume
    saveBtn.addEventListener('click', () => {
        const resumeData = {
            id: Date.now(),
            personal: {
                name: fullNameInput.value,
                email: emailInput.value,
                phone: phoneInput.value,
                location: locationInput.value,
                summary: summaryInput.value
            },
            experiences: [...experiences],
            educations: [...educations],
            skills: [...skills],
            timestamp: new Date().toLocaleDateString()
        };

        savedResumes.unshift(resumeData);
        localStorage.setItem('resumes', JSON.stringify(savedResumes));
        renderSavedResumes();

        // Show feedback
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        saveBtn.style.backgroundColor = '#27ae60';
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.backgroundColor = '#4A90E2';
        }, 2000);
    });

    // Download as simple text (PDF would require additional library)
    downloadBtn.addEventListener('click', () => {
        const resumeText = generateResumeText();
        const blob = new Blob([resumeText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fullNameInput.value || 'Resume'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });

    function generateResumeText() {
        let text = `${fullNameInput.value || 'Your Name'}\n`;
        text += `${emailInput.value || 'email@example.com'} | ${phoneInput.value || 'phone'} | ${locationInput.value || 'location'}\n\n`;
        
        if (summaryInput.value) {
            text += `PROFESSIONAL SUMMARY\n${summaryInput.value}\n\n`;
        }
        
        if (experiences.length > 0) {
            text += `WORK EXPERIENCE\n`;
            experiences.forEach(exp => {
                if (exp.jobTitle || exp.company) {
                    text += `${exp.jobTitle || 'Job Title'} - ${exp.company || 'Company'}\n`;
                    text += `${exp.startDate || 'Start'} - ${exp.endDate || 'End'}\n`;
                    if (exp.description) text += `${exp.description}\n`;
                    text += '\n';
                }
            });
        }
        
        if (educations.length > 0) {
            text += `EDUCATION\n`;
            educations.forEach(edu => {
                if (edu.degree || edu.institution) {
                    text += `${edu.degree || 'Degree'} - ${edu.institution || 'Institution'}`;
                    if (edu.year) text += ` (${edu.year})`;
                    if (edu.gpa) text += ` - GPA: ${edu.gpa}`;
                    text += '\n';
                }
            });
            text += '\n';
        }
        
        if (skills.length > 0) {
            text += `SKILLS\n${skills.join(', ')}\n`;
        }
        
        return text;
    }

    function renderSavedResumes() {
        savedList.innerHTML = '';
        
        if (savedResumes.length === 0) {
            savedList.innerHTML = '<p class="no-resumes">No saved resumes yet.</p>';
            return;
        }

        savedResumes.forEach(resume => {
            const resumeDiv = document.createElement('div');
            resumeDiv.className = 'saved-resume';
            
            resumeDiv.innerHTML = `
                <div class="resume-info">
                    <h4>${resume.personal.name || 'Untitled Resume'}</h4>
                    <span class="timestamp">${resume.timestamp}</span>
                </div>
                <div class="resume-actions">
                    <button class="load-btn" data-id="${resume.id}">Load</button>
                    <button class="delete-btn" data-id="${resume.id}">Delete</button>
                </div>
            `;
            
            savedList.appendChild(resumeDiv);
        });
    }

    // Handle saved resume actions
    savedList.addEventListener('click', (e) => {
        const resumeId = parseInt(e.target.dataset.id);
        const resume = savedResumes.find(r => r.id === resumeId);
        
        if (e.target.classList.contains('load-btn')) {
            // Load resume data
            fullNameInput.value = resume.personal.name || '';
            emailInput.value = resume.personal.email || '';
            phoneInput.value = resume.personal.phone || '';
            locationInput.value = resume.personal.location || '';
            summaryInput.value = resume.personal.summary || '';
            
            // Clear existing data
            experienceList.innerHTML = '';
            educationList.innerHTML = '';
            experiences = [];
            educations = [];
            skills = [...resume.skills];
            
            // Load experiences
            resume.experiences.forEach(exp => {
                addExperienceBtn.click();
                const lastExpItem = experienceList.lastElementChild;
                lastExpItem.querySelector('.job-title').value = exp.jobTitle || '';
                lastExpItem.querySelector('.company').value = exp.company || '';
                lastExpItem.querySelector('.start-date').value = exp.startDate || '';
                lastExpItem.querySelector('.end-date').value = exp.endDate || '';
                lastExpItem.querySelector('.job-description').value = exp.description || '';
            });
            
            // Load educations
            resume.educations.forEach(edu => {
                addEducationBtn.click();
                const lastEduItem = educationList.lastElementChild;
                lastEduItem.querySelector('.degree').value = edu.degree || '';
                lastEduItem.querySelector('.institution').value = edu.institution || '';
                lastEduItem.querySelector('.year').value = edu.year || '';
                lastEduItem.querySelector('.gpa').value = edu.gpa || '';
            });
            
            updateSkills();
            updateExperience();
            updateEducation();
            updatePreview();
            
        } else if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this resume?')) {
                savedResumes = savedResumes.filter(r => r.id !== resumeId);
                localStorage.setItem('resumes', JSON.stringify(savedResumes));
                renderSavedResumes();
            }
        }
    });

    // Initialize
    updatePreview();
    renderSavedResumes();
});