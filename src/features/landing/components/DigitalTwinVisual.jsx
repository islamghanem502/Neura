import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Brain, Wind } from 'lucide-react';

export const DigitalTwinVisual = () => {
    const indicators = [
        { icon: Brain, label: "Neural", color: "#8b5cf6", delay: 0 },
        { icon: Heart, label: "Cardiac", color: "#ef4444", delay: 0.2 },
        { icon: Wind, label: "Respir", color: "#06b6d4", delay: 0.4 },
    ];

    return (
        <div className="relative w-full h-[500px] flex items-center justify-center bg-[#050a0f] rounded-[2.5rem] overflow-hidden border border-white/5">

            {/* الدوائر المركزية النابضة */}
            <div className="relative flex items-center justify-center">
                {/* النبض الخارجي */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full border border-blue-500/20"
                        initial={{ width: 100, height: 100, opacity: 0.8 }}
                        animate={{
                            width: [100, 400],
                            height: [100, 400],
                            opacity: [0.8, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: i * 1.3,
                            ease: "easeOut"
                        }}
                    />
                ))}

                {/* النواة المركزية */}
                <motion.div
                    className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)]"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Activity className="text-white w-12 h-12" />
                </motion.div>
            </div>

            {/* المؤشرات الجانبية البسيطة */}
            <div className="absolute inset-0 p-10 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-start">
                    {indicators.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: item.delay }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                                <item.icon size={20} style={{ color: item.color }} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{item.label}</span>
                        </motion.div>
                    ))}
                </div>

                {/* خط البيانات السفلي (Waveform) */}
                <div className="w-full h-12 flex items-end gap-1 opacity-20">
                    {[...Array(40)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 bg-blue-400 rounded-full"
                            animate={{ height: [10, Math.random() * 40 + 10, 10] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
                        />
                    ))}
                </div>
            </div>

            {/* تيكست خفيف في الزاوية */}
            <div className="absolute bottom-6 right-8">
                <p className="text-[10px] font-mono text-blue-500/50 tracking-tighter uppercase">
                    Digital Twin // System_Active_v2
                </p>
            </div>
        </div>
    );
};