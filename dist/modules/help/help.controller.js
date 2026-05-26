"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHelpArticles = getHelpArticles;
exports.getHelpArticle = getHelpArticle;
async function getHelpArticles(_req, res) {
    // Mock help articles for now
    const articles = [
        {
            id: '1',
            title: 'Getting Started',
            content: 'Welcome to Afristream! This guide will help you get started with our platform.',
            category: 'Getting Started',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'How to Upload Products',
            content: 'Learn how to upload and manage your products in the dashboard.',
            category: 'Products',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '3',
            title: 'Managing Portfolio',
            content: 'Discover how to showcase your work in your portfolio.',
            category: 'Portfolio',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '4',
            title: 'Order Management',
            content: 'Understand how to manage orders and track sales.',
            category: 'Orders',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '5',
            title: 'Account Settings',
            content: 'Learn how to manage your account settings and preferences.',
            category: 'Account',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    res.json({ articles });
}
async function getHelpArticle(req, res) {
    const { id } = req.params;
    // Mock single article
    const article = {
        id,
        title: 'Help Article',
        content: 'This is a detailed help article with step-by-step instructions.',
        category: 'General',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    res.json(article);
}
