"use client";
import { create } from "zustand";
import type { SkillMastery } from "@/types";
const initial:SkillMastery={vocabulary:54,grammar:42,listening:38,reading:61,writing:33,speaking:29,pronunciation:36,shadowing:40};
type Store={skills:SkillMastery;xp:number;streak:number;completed:string[];mistakes:{id:string;text:string;correction:string}[];addXp:(n:number)=>void;complete:(id:string)=>void;improve:(skill:keyof SkillMastery,n:number)=>void;addMistake:(text:string,correction:string)=>void};
export const useLearningStore=create<Store>((set)=>({skills:initial,xp:1280,streak:12,completed:[],mistakes:[{id:"m1",text:"Ich habe gegangen",correction:"Ich bin gegangen"}],addXp:(n)=>set(s=>({xp:s.xp+n})),complete:(id)=>set(s=>({completed:[...new Set([...s.completed,id])]})),improve:(skill,n)=>set(s=>({skills:{...s.skills,[skill]:Math.min(100,s.skills[skill]+n)}})),addMistake:(text,correction)=>set(s=>({mistakes:[{id:crypto.randomUUID(),text,correction},...s.mistakes].slice(0,20)}))}));
