import React from 'react';
import { requireRole } from '@/lib/core/server';

const SeekerDashboardLayout = async ({ children }: { children: React.ReactNode }) => {
    await requireRole('seeker');
    return children;
};

export default SeekerDashboardLayout;