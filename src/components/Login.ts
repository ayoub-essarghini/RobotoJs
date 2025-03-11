import { Component } from "../utils/types";
import { VNode } from "../utils/vdom";

export class Login implements Component {
    constructor() {
        if (localStorage.getItem('token')) {
            window.location.href = '/';
        }
    }

    render(): VNode {
        return {
            tag: "div",
            props: { class: "relative flex items-center justify-center min-h-screen bg-gray-900 overflow-hidden" },
            children: [
                // Halo effects
                {
                    tag: "div",
                    props: { class: "absolute top-0 right-0 w-72 h-72 bg-blue-500 opacity-30 rounded-full blur-3xl animate-pulse" },
                    children: []
                },
                {
                    tag: "div",
                    props: { class: "absolute bottom-0 left-0 w-72 h-72 bg-blue-300 opacity-30 rounded-full blur-3xl animate-pulse" },
                    children: []
                },
                // Login Card
                {
                    tag: "div",
                    props: { class: "z-10 p-8 bg-gray-800 rounded-2xl shadow-xl text-white text-center w-96" },
                    children: [
                        {
                            tag: "h1",
                            props: { class: "text-3xl font-bold" },
                            children: ["Welcome Back!"]
                        },
                        {
                            tag: "p",
                            props: { class: "text-gray-400 mt-2" },
                            children: ["Welcome to Ping Pong, Game"]
                        },
                        {
                            tag: "form",
                            props: { class: "mt-6 flex flex-col gap-4" },
                            children: [
                                {
                                    tag: "input",
                                    props: { type: "email", placeholder: "Email", class: "w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400" },
                                    children: []
                                },
                                {
                                    tag: "input",
                                    props: { type: "password", placeholder: "Password", class: "w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400" },
                                    children: []
                                },
                                {
                                    tag: "button",
                                    props: { type: "submit", class: "w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition duration-300" },
                                    children: ["Login"]
                                }
                            ]
                        },
                        {
                            tag: "div",
                            props: { class: "mt-6" },
                            children: [
                                {
                                    tag: "a",
                                    props: { href: "/auth/google", class: "flex items-center justify-center gap-3 px-6 py-3 text-lg font-semibold text-gray-800 bg-white rounded-lg shadow-md hover:bg-gray-100 transition duration-300" },
                                    children: [
                                        {
                                            tag: "img",
                                            props: { src: "./assets/google.png", alt: "Google", class: "w-6 h-6" },
                                            children: []
                                        },
                                        "Sign in with Google"
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
