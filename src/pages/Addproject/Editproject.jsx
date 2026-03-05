import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import projectService from '../../api/projectService';
import Addproject from './Addproject';

const Editproject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await projectService.getProjectById(id);
                setProject(res.data?.data);
            } catch (err) {
                setError('Failed to load project details.');
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex flex-col h-[50vh] items-center justify-center gap-4 text-center">
                <AlertCircle size={40} className="text-destructive" />
                <p className="font-semibold text-muted-foreground">{error || 'Project not found.'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return <Addproject initialData={project} />;
};

export default Editproject;
