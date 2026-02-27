import apiClient from './apiClient';

const projectService = {
    // === Projects ===
    getAllProjects: () => apiClient.get('/projects'),
    getProjectById: (id) => apiClient.get(`/projects/${id}`),
    createProject: (data) => apiClient.post('/projects', data), // expects FormData for multipart
    updateProject: (id, data) => apiClient.patch(`/projects/${id}`, data),
    deleteProject: (id) => apiClient.delete(`/projects/${id}`),
    assignProject: (id, data) => apiClient.patch(`/projects/${id}/assign`, data), // { clients, manager, teamMembers, action }

    // === Milestones ===
    getMilestones: (projectId) => apiClient.get(`/projects/${projectId}/milestones`),
    createMilestone: (projectId, data) => apiClient.post(`/projects/${projectId}/milestones`, data),
    updateMilestone: (projectId, milestoneId, data) => apiClient.patch(`/projects/${projectId}/milestones/${milestoneId}`, data),
    deleteMilestone: (projectId, milestoneId) => apiClient.delete(`/projects/${projectId}/milestones/${milestoneId}`),
    assignMilestone: (projectId, milestoneId, data) => apiClient.patch(`/projects/${projectId}/milestones/${milestoneId}/assign`, data),

    // === Modules ===
    getModules: (projectId, milestoneId) => apiClient.get(`/projects/${projectId}/milestones/${milestoneId}/modules`),
    createModule: (projectId, milestoneId, data) => apiClient.post(`/projects/${projectId}/milestones/${milestoneId}/modules`, data),
    updateModule: (projectId, milestoneId, moduleId, data) => apiClient.patch(`/projects/${projectId}/milestones/${milestoneId}/modules/${moduleId}`, data),
    assignModule: (projectId, milestoneId, moduleId, data) => apiClient.patch(`/projects/${projectId}/milestones/${milestoneId}/modules/${moduleId}/assign`, data),

    // === Tasks ===
    getTasks: (projectId, milestoneId, moduleId) => apiClient.get(`/projects/${projectId}/milestones/${milestoneId}/modules/${moduleId}/tasks`),
    createTask: (projectId, milestoneId, moduleId, data) => apiClient.post(`/projects/${projectId}/milestones/${milestoneId}/modules/${moduleId}/tasks`, data),
    updateTask: (projectId, milestoneId, moduleId, taskId, data) => apiClient.patch(`/projects/${projectId}/milestones/${milestoneId}/modules/${moduleId}/tasks/${taskId}`, data),
    deleteTask: (projectId, milestoneId, moduleId, taskId) => apiClient.delete(`/projects/${projectId}/milestones/${milestoneId}/modules/${moduleId}/tasks/${taskId}`),
    assignTask: (projectId, milestoneId, moduleId, taskId, data) => apiClient.patch(`/projects/${projectId}/milestones/${milestoneId}/modules/${moduleId}/tasks/${taskId}/assign`, data),

    // === FAQs ===
    addProjectFaq: (projectId, data) => apiClient.post(`/projects/${projectId}/faqs`, data),
    updateProjectFaq: (projectId, faqId, data) => apiClient.patch(`/projects/${projectId}/faqs/${faqId}`, data),
    deleteProjectFaq: (projectId, faqId) => apiClient.delete(`/projects/${projectId}/faqs/${faqId}`),
};

export default projectService;
