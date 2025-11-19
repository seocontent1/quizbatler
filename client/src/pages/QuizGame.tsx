import { useState, useEffect } from "react";
import BattleArena from "@/components/BattleArena";
import QuestionCard from "@/components/QuestionCard";
import AnswerButton from "@/components/AnswerButton";
import ScoreDisplay from "@/components/ScoreDisplay";
import GameOverModal from "@/components/GameOverModal";
import StartScreen from "@/components/StartScreen";
import Timer from "@/components/Timer";
import { Progress } from "@/components/ui/progress";

// ===================================================================
//                           MOCK_QUESTIONS
// (Seu arquivo já possui o array MOCK_QUESTIONS neste arquivo — mantive-o)
// ===================================================================
// const MOCK_QUESTIONS = [ ... ]  <-- já presente no seu arquivo
// ===================================================================

//todo: remove mock functionality - replace with real quiz questions from backend
const MOCK_QUESTIONS = [
{
     id: "1",
     question: "Quem construiu a arca?",
     options: ["Moisés", "Abraão", "Noé", "Davi"],
     correctAnswer: 2,
     difficulty: "easy",
 },
 {
     id: "2",
     question: "Qual era o nome do jardim onde Adão e Eva viviam?",
     options: ["Éden", "Sião", "Getsêmani", "Betel"],
     correctAnswer: 0,
     difficulty: "easy",
 },
 {
     id: "3",
     question: "Quem foi lançado na cova dos leões?",
     options: ["Elias", "Daniel", "José", "Jonas"],
     correctAnswer: 1,
     difficulty: "easy",
 },
 {
     id: "4",
     question: "Quem traiu Jesus por 30 moedas de prata?",
     options: ["Pedro", "Tomé", "Judas Iscariotes", "André"],
     correctAnswer: 2,
     difficulty: "easy",
 },
 {
     id: "5",
     question: "Qual apóstolo negou Jesus três vezes?",
     options: ["Pedro", "João", "Tiago", "Mateus"],
     correctAnswer: 0,
     difficulty: "easy",
 },
 {
     id: "6",
     question: "Em quantos dias Deus criou o mundo?",
     options: ["4", "5", "6", "7"],
     correctAnswer: 2,
     difficulty: "easy",
 },
 {
     id: "7",
     question: "Quem derrotou Golias?",
     options: ["Samuel", "Saul", "Sansão", "Davi"],
     correctAnswer: 3,
     difficulty: "easy",
 },
 {
     id: "8",
     question: "Qual era o nome do pai terreno de Jesus?",
     options: ["José", "Isaac", "Abraão", "João"],
     correctAnswer: 0,
     difficulty: "easy",
 },
 {
     id: "9",
     question: "Quem foi engolido por um grande peixe?",
     options: ["Elias", "Jonas", "Isaías", "Ezequiel"],
     correctAnswer: 1,
     difficulty: "easy",
 },
 {
     id: "10",
     question: "Qual o primeiro livro da Bíblia?",
     options: ["Êxodo", "Gênesis", "Levítico", "Salmos"],
     correctAnswer: 1,
     difficulty: "easy",
 },
 {
     id: "11",
     question: "Quem recebeu os Dez Mandamentos?",
     options: ["Josué", "Davi", "Moisés", "Aarão"],
     correctAnswer: 2,
     difficulty: "easy",
 },
 {
     id: "12",
     question: "Qual era o nome da mãe de Samuel?",
     options: ["Ana", "Maria", "Débora", "Elisabete"],
     correctAnswer: 0,
     difficulty: "medium",
 },
 {
     id: "13",
     question: "Quem foi o primeiro rei de Israel?",
     options: ["Saul", "Davi", "Salomão", "Jeroboão"],
     correctAnswer: 0,
     difficulty: "medium",
 },
 {
     id: "14",
     question: "Quem interpretou os sonhos de Faraó?",
     options: ["Daniel", "José", "Moisés", "Elias"],
     correctAnswer: 1,
     difficulty: "medium",
 },
 {
     id: "15",
     question: "Quem escreveu a maioria das cartas do Novo Testamento?",
     options: ["Pedro", "Paulo", "Tiago", "João"],
     correctAnswer: 1,
     difficulty: "medium",
 },
 {
     id: "16",
     question: "Qual profeta enfrentou os profetas de Baal no Monte Carmelo?",
     options: ["Eliseu", "Elias", "Miquéias", "Amós"],
     correctAnswer: 1,
     difficulty: "medium",
 },
 {
     id: "17",
     question: "Quem foi a esposa de Abraão?",
     options: ["Rebeca", "Sara", "Raquel", "Lia"],
     correctAnswer: 1,
     difficulty: "easy",
 },
 {
     id: "18",
     question: "Qual discípulo era cobrador de impostos?",
     options: ["Lucas", "Mateus", "Bartolomeu", "Filipe"],
     correctAnswer: 1,
     difficulty: "medium",
 },
 {
     id: "19",
     question: "Quem disse 'Eu sou o caminho, a verdade e a vida'?",
     options: ["Pedro", "Paulo", "João Batista", "Jesus"],
     correctAnswer: 3,
     difficulty: "easy",
 },
 {
     id: "20",
     question: "Qual rei construiu o templo de Jerusalém?",
     options: ["Saul", "Davi", "Salomão", "Hezequias"],
     correctAnswer: 2,
     difficulty: "medium",
 },
 {
     id: "21",
     question: "Onde Jesus nasceu?",
     options: ["Nazaré", "Belém", "Jericó", "Jerusalém"],
     correctAnswer: 1,
     difficulty: "easy",
 },
 {
     id: "22",
     question: "Quem era o homem mais forte da Bíblia?",
     options: ["Golias", "Saul", "Sansão", "Absalão"],
     correctAnswer: 2,
     difficulty: "easy",
 },
 {
     id: "23",
     question: "Quem sucedeu Moisés?",
     options: ["Calebe", "Josué", "Arão", "Eli"],
     correctAnswer: 1,
     difficulty: "medium",
 },
 {
     id: "24",
     question: "Qual profeta foi arrebatado em um redemoinho?",
     options: ["Elias", "Eliseu", "Jeremias", "Zacarias"],
     correctAnswer: 0,
     difficulty: "hard",
 },
 {
     id: "25",
     question: "Quantos capítulos tem o livro de Salmos?",
     options: ["100", "119", "150", "200"],
     correctAnswer: 2,
     difficulty: "medium",
 },
 {
     id: "26",
     question: "Quem foi o pai de João Batista?",
     options: ["José", "Zacarias", "Simeão", "Natanael"],
     correctAnswer: 1,
     difficulty: "medium",
 },
 {
     id: "27",
     question: "Quem disse 'Eu e minha casa serviremos ao Senhor'?",
     options: ["Josué", "Moisés", "Samuel", "Davi"],
     correctAnswer: 0,
     difficulty: "medium",
 },
 {
     id: "28",
     question: "Quem foi conhecido como 'o amigo de Deus'?",
     options: ["Davi", "Abraão", "Isaac", "Noé"],
     correctAnswer: 1,
     difficulty: "medium",
 },
 {
     id: "29",
     question: "Quem teve um sonho com uma escada que ia até o céu?",
     options: ["Jacó", "José", "Isaque", "Samuel"],
     correctAnswer: 0,
     difficulty: "medium",
 },
 {
     id: "30",
     question: "Quem negou Jesus e depois chorou amargamente?",
     options: ["Pedro", "Tomé", "Judas", "André"],
     correctAnswer: 0,
     difficulty: "easy",
 },
 {
     id: "31",
     question: "Quem foi apedrejado até a morte no Novo Testamento?",
     options: ["Pedro", "Estevão", "Tiago", "Paulo"],
     correctAnswer: 1,
     difficulty: "medium",
 },
 {
     id: "32",
     question: "Qual profeta foi chamado ainda no ventre?",
     options: ["Jeremias", "Isaías", "Jonas", "Habacuque"],
     correctAnswer: 0,
     difficulty: "hard",
 },
 {
     id: "33",
     question: "Quem cortou a orelha de Malco?",
     options: ["Pedro", "Tiago", "João", "André"],
     correctAnswer: 0,
     difficulty: "medium",
 },
 {
     id: "34",
     question: "Quem foi a mãe de Jesus?",
     options: ["Marta", "Maria", "Elisabete", "Ana"],
     correctAnswer: 1,
     difficulty: "easy",
 },
 {
     id: "35",
     question: "Quem batizou Jesus?",
     options: ["Pedro", "João Batista", "Tiago", "André"],
     correctAnswer: 1,
     difficulty: "easy",
 },
 {
     id: "36",
     question: "Quantos discípulos Jesus escolheu?",
     options: ["10", "11", "12", "13"],
     correctAnswer: 2,
     difficulty: "easy",
 },
 {
     id: "37",
     question: "Qual livro vem depois de Atos?",
     options: ["Romanos", "Coríntios", "Gálatas", "Efésios"],
     correctAnswer: 0,
     difficulty: "medium",
 },
 {
     id: "38",
     question: "Quem foi levado ao céu sem morrer?",
     options: ["Moisés", "Elias", "Eliseu", "Jeremias"],
     correctAnswer: 1,
     difficulty: "hard",
 },
 {
     id: "39",
     question: "Quem construiu um altar no Monte Carmelo?",
     options: ["Elias", "Samuel", "Davi", "Gideão"],
     correctAnswer: 0,
     difficulty: "hard",
 },
 {
     id: "40",
     question: "Quem escreveu o livro do Apocalipse?",
     options: ["Pedro", "João", "Paulo", "Tiago"],
     correctAnswer: 1,
     difficulty: "medium",
 },
 {
     id: "41",
     question: "Quem derrubou os muros de Jericó?",
     options: ["Moisés", "Josué", "Gideão", "Sansão"],
     correctAnswer: 1,
     difficulty: "easy",
 },
 {
     id: "42",
     question: "Quem foi o gigante morto por Davi?",
     options: ["Apolônio", "Golias", "Senáqueribe", "Arfaxade"],
     correctAnswer: 1,
     difficulty: "easy",
 },
 {
     id: "43",
     question: "Quem viu a sarça ardente?",
     options: ["Abraão", "Elias", "Moisés", "Jacó"],
     correctAnswer: 2,
     difficulty: "easy",
 },
 {
     id: "44",
     question: "Qual profeta casou-se com uma prostituta?",
     options: ["Oséias", "Joel", "Amós", "Jonas"],
     correctAnswer: 0,
     difficulty: "hard",
 },
 {
     id: "45",
     question: "Quem interpretou o sonho da mão escrevendo na parede?",
     options: ["Daniel", "José", "Ezequiel", "Jeremias"],
     correctAnswer: 0,
     difficulty: "medium",
 },
 {
     id: "46",
     question: "Qual discípulo era conhecido como 'o discípulo amado'?",
     options: ["Pedro", "Tiago", "João", "André"],
     correctAnswer: 2,
     difficulty: "easy",
 },
 {
     id: "47",
     question: "Quem derrubou o ídolo Dagon?",
     options: ["Sansão", "Samuel", "Davi", "Josué"],
     correctAnswer: 1,
     difficulty: "hard",
 },
 {
     id: "48",
     question: "Quem pediu sabedoria a Deus?",
     options: ["Davi", "Salomão", "Samuel", "Moisés"],
     correctAnswer: 1,
     difficulty: "easy",
 },
 {
     id: "49",
     question: "Quem ressuscitou Lázaro?",
     options: ["Pedro", "Jesus", "Eliseu", "Paulo"],
     correctAnswer: 1,
     difficulty: "easy",
 },
 {
     id: "50",
     question: "Quem foi o último juiz de Israel?",
     options: ["Eli", "Samuel", "Gideão", "Sansão"],
     correctAnswer: 1,
     difficulty: "medium",
 },
{
    id: "51",
    question: "Quem ungiu Davi como rei de Israel?",
    options: ["Eli", "Samuel", "Natã", "Gideão"],
    correctAnswer: 1,
    difficulty: "medium",
},
{
    id: "52",
    question: "Quem foi o homem mais paciente da Bíblia?",
    options: ["Davi", "Jó", "Moisés", "Elias"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "53",
    question: "Onde Jesus realizou seu primeiro milagre?",
    options: ["Jerusalém", "Canaã", "Nazaré", "Belém"],
    correctAnswer: 1,
    difficulty: "medium",
},
{
    id: "54",
    question: "Quem foi a mulher que virou uma estátua de sal?",
    options: ["Esposa de Noé", "Esposa de Ló", "Esposa de Abraão", "Esposa de Jacó"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "55",
    question: "Quem matou o irmão por inveja?",
    options: ["Esaú", "Caim", "Ismael", "Ham"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "56",
    question: "Qual rei jogou Daniel na cova dos leões?",
    options: ["Nabucodonosor", "Dario", "Ciro", "Artaxerxes"],
    correctAnswer: 1,
    difficulty: "medium",
},
{
    id: "57",
    question: "Quem sonhou com feixes de trigo se curvando diante dele?",
    options: ["Moisés", "José", "Abraão", "Isaque"],
    correctAnswer: 1,
    difficulty: "medium",
},
{
    id: "58",
    question: "Quem conduziu o povo de Israel para fora da Babilônia?",
    options: ["Esdras", "Neemias", "Josué", "Moisés"],
    correctAnswer: 0,
    difficulty: "hard",
},
{
    id: "59",
    question: "Quem era conhecido como o 'profeta chorão'?",
    options: ["Isaías", "Jeremias", "Ezequiel", "Miqueias"],
    correctAnswer: 1,
    difficulty: "medium",
},
{
    id: "60",
    question: "Em que cidade Jesus cresceu?",
    options: ["Nazaré", "Belém", "Cafarnaum", "Jericó"],
    correctAnswer: 0,
    difficulty: "easy",
},
{
    id: "61",
    question: "Quem pediu para andar sobre as águas com Jesus?",
    options: ["Pedro", "André", "João", "Filipe"],
    correctAnswer: 0,
    difficulty: "easy",
},
{
    id: "62",
    question: "Quem escreveu o livro de Provérbios?",
    options: ["Davi", "Salomão", "Samuel", "Moisés"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "63",
    question: "Quem perseguiu os cristãos antes de se converter?",
    options: ["Pedro", "Paulo", "Tiago", "João"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "64",
    question: "Qual discípulo colocou a mão no lado de Jesus ressuscitado?",
    options: ["Tomé", "Pedro", "André", "Tiago"],
    correctAnswer: 0,
    difficulty: "medium",
},
{
    id: "65",
    question: "Quem abriu o Mar Vermelho?",
    options: ["Josué", "Moisés", "Aarão", "Davi"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "66",
    question: "Quem era a esposa de Isaque?",
    options: ["Sara", "Rebeca", "Lia", "Raquel"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "67",
    question: "Quem foi preso e teve visões na ilha de Patmos?",
    options: ["João", "Pedro", "Paulo", "Estevão"],
    correctAnswer: 0,
    difficulty: "medium",
},
{
    id: "68",
    question: "Qual profeta reviveu o filho da viúva de Sarepta?",
    options: ["Eliseu", "Elias", "Jeremias", "Isaías"],
    correctAnswer: 1,
    difficulty: "hard",
},
{
    id: "69",
    question: "Quem caiu da janela enquanto Paulo pregava?",
    options: ["Timóteo", "Êutico", "Tito", "Filemom"],
    correctAnswer: 1,
    difficulty: "hard",
},
{
    id: "70",
    question: "Quem mandou construir a arca da aliança?",
    options: ["Moisés", "Josué", "Davi", "Salomão"],
    correctAnswer: 0,
    difficulty: "medium",
},
{
    id: "71",
    question: "Quem foi jogado em uma fornalha ardente?",
    options: ["Sadraque, Mesaque e Abede-Nego", "José", "Elias", "Gideão"],
    correctAnswer: 0,
    difficulty: "easy",
},
{
    id: "72",
    question: "Quem disse: 'Eu sou a luz do mundo'?",
    options: ["João Batista", "Jesus", "Pedro", "Elias"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "73",
    question: "Quem cortou o cabelo de Sansão?",
    options: ["Dalila", "Raquel", "Lia", "Miriã"],
    correctAnswer: 0,
    difficulty: "medium",
},
{
    id: "74",
    question: "Qual foi o sinal do pacto com Noé?",
    options: ["Uma pomba", "Um arco-íris", "Uma estrela", "Uma nuvem"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "75",
    question: "Quem encontrou Moisés bebê no rio?",
    options: ["A filha de Faraó", "Miriã", "Zípora", "Ana"],
    correctAnswer: 0,
    difficulty: "easy",
},
{
    id: "76",
    question: "Quem foi rei depois de Salomão?",
    options: ["Jeroboão", "Roboão", "Asa", "Josias"],
    correctAnswer: 1,
    difficulty: "medium",
},
{
    id: "77",
    question: "Quem enfrentou um leão e um urso antes de lutar contra Golias?",
    options: ["Saul", "Davi", "Sansão", "Gideão"],
    correctAnswer: 1,
    difficulty: "medium",
},
{
    id: "78",
    question: "Quem escreveu o livro de Lamentações?",
    options: ["Ezequiel", "Jeremias", "Isaías", "Daniel"],
    correctAnswer: 1,
    difficulty: "hard",
},
{
    id: "79",
    question: "Quem foi o profeta que casou com uma mulher adúltera por ordem de Deus?",
    options: ["Oseias", "Joel", "Amós", "Miqueias"],
    correctAnswer: 0,
    difficulty: "hard",
},
{
    id: "80",
    question: "Quem chamou fogo do céu que consumiu os soldados?",
    options: ["Eliseu", "Elias", "Moisés", "Jeremias"],
    correctAnswer: 1,
    difficulty: "hard",
},
{
    id: "81",
    question: "Quem ajudou Jesus a carregar a cruz?",
    options: ["Simão Cireneu", "José de Arimateia", "Pedro", "João"],
    correctAnswer: 0,
    difficulty: "easy",
},
{
    id: "82",
    question: "Quem era o profeta durante o cativeiro babilônico que viu quatro seres viventes?",
    options: ["Ezequiel", "Daniel", "Jeremias", "Isaías"],
    correctAnswer: 0,
    difficulty: "hard",
},
{
    id: "83",
    question: "Quem batizou o eunuco etíope?",
    options: ["Pedro", "Paulo", "Filipe", "Tiago"],
    correctAnswer: 2,
    difficulty: "medium",
},
{
    id: "84",
    question: "Quem enganou Esaú e recebeu a bênção de Isaque?",
    options: ["Jacó", "José", "Benjamim", "Judá"],
    correctAnswer: 0,
    difficulty: "easy",
},
{
    id: "85",
    question: "Quem foi pendurado pelos cabelos em uma árvore?",
    options: ["Absalão", "Saul", "Jonas", "Hamã"],
    correctAnswer: 0,
    difficulty: "medium",
},
{
    id: "86",
    question: "Quem foi chamado de 'varão muito amado'?",
    options: ["Daniel", "Davi", "Paulo", "Jeremias"],
    correctAnswer: 0,
    difficulty: "hard",
},
{
    id: "87",
    question: "Quantos livros há no Novo Testamento?",
    options: ["24", "25", "26", "27"],
    correctAnswer: 3,
    difficulty: "easy",
},
{
    id: "88",
    question: "Quem caiu de um cavalo ao ver uma luz do céu?",
    options: ["Pedro", "Paulo", "Tiago", "João"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "89",
    question: "Quem foi poupado na arca além de Noé?",
    options: ["Toda a cidade", "Sua esposa e seus três filhos e noras", "Somente animais", "Os sacerdotes"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "90",
    question: "Quem liderou Israel após a morte de Josué?",
    options: ["Eli", "Samuel", "Os juízes", "Os reis"],
    correctAnswer: 2,
    difficulty: "medium",
},
{
    id: "91",
    question: "Quem foi chamado para profetizar aos ninivitas?",
    options: ["Miquéias", "Jonas", "Amós", "Joel"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "92",
    question: "Quem perdeu tudo o que tinha, mas permaneceu fiel a Deus?",
    options: ["Abraão", "Jó", "Isaque", "Jacó"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "93",
    question: "Quem enfrentou 300 homens contra milhares de midianitas?",
    options: ["Gideão", "Sansão", "Saul", "Davi"],
    correctAnswer: 0,
    difficulty: "medium",
},
{
    id: "94",
    question: "Quem ressuscitou o filho da sunamita?",
    options: ["Elias", "Eliseu", "Jeremias", "Isaías"],
    correctAnswer: 1,
    difficulty: "hard",
},
{
    id: "95",
    question: "Quem mediu o vale dos ossos secos?",
    options: ["Jeremias", "Isaías", "Ezequiel", "Daniel"],
    correctAnswer: 2,
    difficulty: "hard",
},
{
    id: "96",
    question: "Quem reconstruiu os muros de Jerusalém?",
    options: ["Esdras", "Neemias", "Josias", "Salomão"],
    correctAnswer: 1,
    difficulty: "medium",
},
{
    id: "97",
    question: "Quem pediu um prato de lentilhas em troca da primogenitura?",
    options: ["Jacó", "Esaú", "Ismael", "Benjamim"],
    correctAnswer: 1,
    difficulty: "easy",
},
{
    id: "98",
    question: "Quem libertou Israel derrotando os filisteus com uma queixada de jumento?",
    options: ["Davi", "Gideão", "Sansão", "Saul"],
    correctAnswer: 2,
    difficulty: "medium",
},
{
    id: "99",
    question: "Quem foi ao céu em espírito no Dia do Senhor?",
    options: ["Pedro", "João", "Paulo", "Tiago"],
    correctAnswer: 1,
    difficulty: "medium",
},
{
    id: "100",
    question: "Quem foi considerada a mulher mais sábia da Bíblia?",
    options: ["Débora", "Abigail", "Ester", "Noemi"],
    correctAnswer: 1,
    difficulty: "hard",
},
{
  id: "101",
  question: "Qual era o nome do escriba que ajudou Jeremias a escrever suas profecias?",
  options: ["Baraque", "Asafe", "Semaías", "Nadabe"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "102",
  question: "Qual rei mandou perguntar ao profeta Eliseu se deveria atacar Ramote-Gileade?",
  options: ["Acabe", "Jeosafá", "Jorão", "Jeú"],
  correctAnswer: 2,
  difficulty: "hard",
},
{
  id: "103",
  question: "Qual profeta descreveu um cinto de linho que foi escondido perto do rio Eufrates?",
  options: ["Jeremias", "Isaías", "Ezequiel", "Oséias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "104",
  question: "Em qual livro aparece a visão dos quatro artesãos que aterrorizam os quatro chifres?",
  options: ["Zacarias", "Daniel", "Ezequiel", "Ageu"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "105",
  question: "Quem foi o sacerdote que adotou Samuel quando criança?",
  options: ["Eli", "Fineias", "Abiatar", "Zadoque"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "106",
  question: "Quantas vezes Paulo foi açoitado com varas, segundo ele próprio relata?",
  options: ["Uma vez", "Duas vezes", "Três vezes", "Cinco vezes"],
  correctAnswer: 3,
  difficulty: "hard",
},
{
  id: "107",
  question: "Qual era o nome da cidade onde Paulo encontrou discípulos de João Batista que não conheciam o Espírito Santo?",
  options: ["Éfeso", "Corinto", "Antioquia", "Colossos"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "108",
  question: "Qual profeta teve a visão de um rolo voador?",
  options: ["Ezequiel", "Zacarias", "Joel", "Malaquias"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "109",
  question: "Quem foi o rei da Babilônia que colocou Joaquim no trono de Judá?",
  options: ["Nabucodonosor", "Evil-Merodaque", "Nabonido", "Belshazar"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "110",
  question: "Qual dos discípulos Jesus viu sentado debaixo de uma figueira?",
  options: ["Natanael", "Felipe", "André", "Judas Tadeu"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "111",
  question: "Em qual livro aparece a profecia do vale dos ossos secos?",
  options: ["Isaías", "Jeremias", "Ezequiel", "Daniel"],
  correctAnswer: 2,
  difficulty: "hard",
},
{
  id: "112",
  question: "Quem sucedeu Moisés como líder dos israelitas?",
  options: ["Josué", "Calebe", "Arão", "Eleazar"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "113",
  question: "Qual profeta comparou Israel a um bolo não virado?",
  options: ["Amós", "Oséias", "Malaquias", "Sofonias"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "114",
  question: "Quem era o pai de Saul, o primeiro rei de Israel?",
  options: ["Quis", "Ner", "Abiel", "Gibeá"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "115",
  question: "Qual mulher matou Sísera com uma estaca?",
  options: ["Débora", "Jael", "Ada", "Zeruia"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "116",
  question: "Qual rei mandou matar todos os sacerdotes de Nobe?",
  options: ["Saul", "Davi", "Salomão", "Ezequias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "117",
  question: "Qual discípulo de Paulo era filho de uma judia e de um grego?",
  options: ["Tito", "Timóteo", "Lucas", "Filemom"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "118",
  question: "Quem foi o juiz que fez um voto precipitado envolvendo sua filha?",
  options: ["Gideão", "Jefté", "Sansão", "Boaz"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "119",
  question: "Qual profeta foi instruído a casar-se com uma prostituta como símbolo profético?",
  options: ["Zacarias", "Oséias", "Amós", "Ezequiel"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "120",
  question: "Qual discípulo é chamado no Novo Testamento de 'o Zelote'?",
  options: ["Simão", "Tiago", "Tomé", "Tadeu"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "121",
  question: "Quem foi o profeta que enfrentou 400 profetas de Aserá no Monte Carmelo?",
  options: ["Eliseu", "Elias", "Micaías", "Obadias"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "122",
  question: "Qual era o nome do rei que viu a mão escrevendo na parede durante um banquete?",
  options: ["Ciro", "Dario", "Belshazar", "Nabonido"],
  correctAnswer: 2,
  difficulty: "hard",
},
{
  id: "123",
  question: "Qual profeta descreveu a queda de Lúcifer como 'estrela da manhã, filho da alva'?",
  options: ["Ezequiel", "Jeremias", "Isaías", "Daniel"],
  correctAnswer: 2,
  difficulty: "hard",
},
{
  id: "124",
  question: "Quem reconstruiu os muros de Jerusalém após o exílio?",
  options: ["Esdras", "Neemias", "Zorobabel", "Ageu"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "125",
  question: "Quem foi o profeta engolido por um grande peixe?",
  options: ["Jonas", "Naum", "Habacuque", "Joel"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "126",
  question: "Qual livro termina com a frase 'Lembrai-vos da lei de Moisés, meu servo'?",
  options: ["Ageu", "Malaquias", "Zacarias", "Isaías"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "127",
  question: "Quem era o responsável pela coleta de impostos em Jericó que subiu numa árvore para ver Jesus?",
  options: ["Mateus", "Bartimeu", "Zaqueu", "Cornélio"],
  correctAnswer: 2,
  difficulty: "hard",
},
{
  id: "128",
  question: "Qual dos seguintes reis começou a reinar com apenas 8 anos?",
  options: ["Josias", "Manassés", "Joás", "Ezequias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "129",
  question: "Qual profeta viu um anjo com um prumo na mão?",
  options: ["Amós", "Habacuque", "Obadias", "Sofonias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "130",
  question: "Qual o nome do marido de Priscila, companheiros de Paulo na obra?",
  options: ["Aquila", "Apolo", "Crescente", "Lúcio"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "131",
  question: "Quem ajudou a carregar a cruz de Jesus?",
  options: ["Simão Cireneu", "José de Arimateia", "João Marcos", "Nicodemos"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "132",
  question: "Qual profeta foi instruído a deitar-se 390 dias sobre um lado e 40 sobre o outro?",
  options: ["Jeremias", "Isaías", "Ezequiel", "Daniel"],
  correctAnswer: 2,
  difficulty: "hard",
},
{
  id: "133",
  question: "Qual é o único evangelista que era médico?",
  options: ["Mateus", "Marcos", "Lucas", "João"],
  correctAnswer: 2,
  difficulty: "hard",
},
{
  id: "134",
  question: "Qual profeta viu uma visão de Deus sentado sobre um trono alto e sublime?",
  options: ["Isaías", "Jeremias", "Ezequiel", "Joel"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "135",
  question: "Quem foi a mulher que morreu ao olhar para trás durante a destruição de Sodoma?",
  options: ["Sara", "Miriã", "A mulher de Ló", "Zilpa"],
  correctAnswer: 2,
  difficulty: "hard",
},
{
  id: "136",
  question: "Qual rei de Israel foi conhecido por suas muitas obras, mas morreu de lepra?",
  options: ["Uzias", "Jotão", "Acaz", "Manassés"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "137",
  question: "Quem interpretou o sonho de Faraó sobre as vacas gordas e magras?",
  options: ["José", "Moisés", "Arão", "Daniel"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "138",
  question: "Quem tomou o lugar de Judas Iscariotes entre os apóstolos?",
  options: ["Matias", "Justo", "Tadeu", "Barnabé"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "139",
  question: "Quem foi o rei que escreveu muitos Provérbios além de Salomão?",
  options: ["Ezequias", "Davi", "Esaú", "Jeroboão"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "140",
  question: "Qual profeta anunciou que o Messias nasceria em Belém?",
  options: ["Isaías", "Miquéias", "Oséias", "Ageu"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "141",
  question: "Quem viu uma visão de uma estátua com cabeça de ouro e pés de ferro e barro?",
  options: ["Daniel", "Ezequiel", "Isaías", "Jeremias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "142",
  question: "Quem foi o rei que trouxe a Arca da Aliança para Jerusalém?",
  options: ["Saul", "Davi", "Salomão", "Roboão"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "143",
  question: "Qual juiz matou um leão com suas próprias mãos?",
  options: ["Gideão", "Sansão", "Otniel", "Abimeleque"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "144",
  question: "Quem escreveu o livro de Atos dos Apóstolos?",
  options: ["Paulo", "Lucas", "Pedro", "Tiago"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "145",
  question: "Qual profeta viu rodas cheias de olhos?",
  options: ["Isaías", "Ezequiel", "Daniel", "Habacuque"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "146",
  question: "Quem foi o rei que pediu sabedoria a Deus ainda jovem?",
  options: ["Roboão", "Josias", "Salomão", "Ezequias"],
  correctAnswer: 2,
  difficulty: "hard",
},
{
  id: "147",
  question: "Qual apóstolo teve uma visão de um lençol descendo do céu com animais impuros?",
  options: ["João", "Pedro", "Tiago", "André"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "148",
  question: "Quem foi o homem que tentou comprar o dom do Espírito Santo dos apóstolos?",
  options: ["Simão", "Cornélio", "Elimas", "Ananias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "149",
  question: "Qual profeta teve a visão de um gafanhoto devorando a terra?",
  options: ["Joel", "Amós", "Naum", "Zacarias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "150",
  question: "Qual líder levou Jeremias para o Egito contra sua vontade?",
  options: ["Zedequias", "Jeoaquim", "Gedalias", "Joanã"],
  correctAnswer: 3,
  difficulty: "hard",
},
{
  id: "151",
  question: "Qual profeta mencionou um 'pacto com a morte' feito por Israel?",
  options: ["Isaías", "Jeremias", "Ezequiel", "Oseias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "152",
  question: "Quem foi o rei que enviou uma carta a Ezequias após sua doença ser curada?",
  options: ["Merodaque-Baladã", "Nabucodonosor", "Ben-Hadade", "Faraó Neco"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "153",
  question: "Qual é o único salmo atribuído a Moisés?",
  options: ["Salmo 90", "Salmo 72", "Salmo 18", "Salmo 101"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "154",
  question: "Qual profeta descreve mulheres costurando travesseiros mágicos para enganar o povo?",
  options: ["Ezequiel", "Jeremias", "Joel", "Habacuque"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "155",
  question: "Qual juiz fez um voto imprudente que resultou na oferta de sua própria filha?",
  options: ["Jefté", "Gideão", "Sansão", "Tola"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "156",
  question: "Qual rei tentou matar Jeremias jogando-o numa cisterna?",
  options: ["Zedequias", "Jeoaquim", "Evil-Merodaque", "Jeconias"],
  correctAnswer: 1,
  difficulty: "hard",
},
{
  id: "157",
  question: "Qual profeta viu um rolo voando em uma visão?",
  options: ["Zacarias", "Ezequiel", "Daniel", "Joel"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "158",
  question: "Em qual evangelho aparece o jovem que fugiu nu durante a prisão de Jesus?",
  options: ["Marcos", "Lucas", "João", "Mateus"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "159",
  question: "Qual profeta menciona que Deus chamaria o Egito de 'Meu povo' e a Assíria de 'obra de minhas mãos'?",
  options: ["Isaías", "Ezequiel", "Naum", "Jeremias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "160",
  question: "Qual mulher matou o filho de Saul, Isbosete?",
  options: ["Baaná e Recabe", "Jael", "Rispa", "Abigail"],
  correctAnswer: 0,
  difficulty: "hard",
},

{
  id: "161",
  question: "Qual profeta viveu entre os exilados do rio Quebar?",
  options: ["Ezequiel", "Daniel", "Jeremias", "Ageu"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "162",
  question: "Quem foi o sacerdote que trouxe o livro da Lei a Esdras?",
  options: ["Hilquias", "Zadoque", "Pinhás", "Eloiaribe"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "163",
  question: "Quantas vezes Paulo recebeu dos judeus 40 açoites menos um?",
  options: ["Cinco", "Três", "Sete", "Duas"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "164",
  question: "Qual profeta descreve um gafanhoto chamado 'destruidor' (hebraico: gazam)?",
  options: ["Joel", "Habacuque", "Sofonias", "Obadias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "165",
  question: "Quem sucedeu Moisés na liderança do cântico de Deuteronômio 32?",
  options: ["Josué", "Arão", "Calebe", "Finéias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "166",
  question: "Quem foi o rei que consultou o profeta Micaías, filho de Inlá?",
  options: ["Acabe", "Manassés", "Uzias", "Jotão"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "167",
  question: "Qual profeta descreve um 'cordel de medir' usado por Deus para julgar Jerusalém?",
  options: ["Isaías", "Ezequiel", "Amós", "Zacarias"],
  correctAnswer: 2,
  difficulty: "hard",
},
{
  id: "168",
  question: "Qual rei foi atacado por um verme e morreu, segundo Atos 12?",
  options: ["Herodes Agripa I", "Herodes Antipas", "Festo", "Pilatos"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "169",
  question: "Qual profeta menciona que Israel seria vendido por 'um par de sandálias'?",
  options: ["Amós", "Oseias", "Ageu", "Malaquias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "170",
  question: "Quem era o governador da Síria quando Paulo fugiu de Damasco por um cesto?",
  options: ["Aretas", "Félix", "Festo", "Agripa"],
  correctAnswer: 0,
  difficulty: "hard",
},

{
  id: "171",
  question: "Qual profeta viu um vale de ossos secos reviver?",
  options: ["Ezequiel", "Isaías", "Jeremias", "Daniel"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "172",
  question: "Quem foi o escriba que leu o livro da Lei diante do povo nos dias de Josias?",
  options: ["Safã", "Esdras", "Zadoque", "Pedaías"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "173",
  question: "Quem amaldiçoou uma geração dizendo: 'Eles mataram um homem por causa da minha ferida'?",
  options: ["Lameque", "Caim", "Esau", "Simei"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "174",
  question: "Qual foi o profeta que escondeu seu cinto de linho junto ao Eufrates?",
  options: ["Jeremias", "Isaías", "Ezequiel", "Oseias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "175",
  question: "Qual é o único evangelho que registra o diálogo entre Jesus e o bom ladrão na cruz?",
  options: ["Lucas", "Mateus", "Marcos", "João"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "176",
  question: "Quem foi o rei que queimou o rolo de Jeremias com uma faca de escrivão?",
  options: ["Jeoaquim", "Zedequias", "Manassés", "Acazias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "177",
  question: "Qual profeta descreveu quatro ferreiros que derrotariam quatro chifres?",
  options: ["Zacarias", "Daniel", "Habacuque", "Joel"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "178",
  question: "Qual rei perdeu o polegar e os dedões dos pés nas mãos de Judá?",
  options: ["Adoni-Bezeque", "Sisaque", "Ben-Hadade", "Hadade"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "179",
  question: "Quem derrubou a casa sobre si para matar mais inimigos em sua morte do que em sua vida?",
  options: ["Sansão", "Absalão", "Acã", "Abner"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "180",
  question: "Qual rei se tornou leproso por tentar queimar incenso no templo?",
  options: ["Uzias", "Jeroboão II", "Saul", "Manassés"],
  correctAnswer: 0,
  difficulty: "hard",
},

{
  id: "181",
  question: "Qual profeta recebeu ordem para preparar pão cozido sobre esterco?",
  options: ["Ezequiel", "Jeremias", "Isaías", "Malaquias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "182",
  question: "Qual discípulo foi enviado para restaurar a visão de Paulo?",
  options: ["Ananias", "Barnabé", "Silas", "Tito"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "183",
  question: "Qual profeta teve de casar-se com uma mulher adúltera por ordem de Deus?",
  options: ["Oseias", "Ezequiel", "Jeremias", "Isaías"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "184",
  question: "Qual personagem bíblico foi chamado de 'homem de muitas palavras' pelo apóstolo Paulo?",
  options: ["Tertulo", "Alexandre", "Demétrio", "Nicolaus"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "185",
  question: "Qual profeta é chamado de 'o mais chorão' na tradição judaica?",
  options: ["Jeremias", "Habacuque", "Ezequiel", "Obadias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "186",
  question: "Quem amaldiçoou crianças que zombavam dele, resultando na aparição de duas ursas?",
  options: ["Eliseu", "Elias", "Samuel", "Davi"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "187",
  question: "Qual profeta descreve um pano manchado usado para ilustrar a impureza de Judá?",
  options: ["Jeremias", "Isaías", "Ezequiel", "Oseias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "188",
  question: "Qual profeta foi proibido de chorar ou lamentar a morte de sua esposa?",
  options: ["Ezequiel", "Oseias", "Jeremias", "Zacarias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "189",
  question: "Quem amaldiçoou Joabe e sua família no Antigo Testamento?",
  options: ["Davi", "Samuel", "Eli", "Natã"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "190",
  question: "Qual é o menor livro do Antigo Testamento?",
  options: ["Obadias", "Ageu", "Naum", "Sofonias"],
  correctAnswer: 0,
  difficulty: "hard",
},

{
  id: "191",
  question: "Qual salmo menciona a expressão: 'Meus ossos estão desconjuntados' profeticamente sobre o Messias?",
  options: ["Salmo 22", "Salmo 2", "Salmo 110", "Salmo 45"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "192",
  question: "Qual profeta viu quatro monstros emergindo do mar?",
  options: ["Daniel", "Ezequiel", "Isaías", "Zacarias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "193",
  question: "Quem libertou Jeremias da prisão lamacenta?",
  options: ["Ebed-Meleque", "Baruque", "Gedalias", "Urias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "194",
  question: "Quem foi o homem que caiu da janela enquanto Paulo pregava?",
  options: ["Êutico", "Ársipo", "Demétrio", "Sópatro"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "195",
  question: "Qual profeta teve sua visão gravada em um tablete para ser lida correndo?",
  options: ["Habacuque", "Naum", "Joel", "Ageu"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "196",
  question: "Quem era o sacerdote quando Samuel ouviu Deus chamar seu nome pela primeira vez?",
  options: ["Eli", "Finéias", "Abiatar", "Zadoque"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "197",
  question: "Qual profeta menciona que Deus 'pisou o lagar sozinho'?",
  options: ["Isaías", "Malaquias", "Joel", "Ezequiel"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "198",
  question: "Quem matou Gedalias, governador nomeado pelos babilônios?",
  options: ["Ismael, filho de Netanias", "Joabe", "Zedequias", "Beraquias"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "199",
  question: "Qual profeta foi perseguido pelo sacerdote Pasur e colocado no tronco?",
  options: ["Jeremias", "Isaías", "Obadias", "Ezequiel"],
  correctAnswer: 0,
  difficulty: "hard",
},
{
  id: "200",
  question: "Quem teve uma visão de um ser com corpo de berilo e rosto como relâmpago?",
  options: ["Daniel", "Ezequiel", "Isaías", "Zacarias"],
  correctAnswer: 0,
  difficulty: "hard",
},
];

// ----------------- RANDOMIZAÇÃO DE PERGUNTAS E OPÇÕES -----------------

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleOptions(question: any) {
  const originalOptions = question.options ?? [];
  const options = shuffleArray(originalOptions);
  const correctValue = originalOptions[question.correctAnswer];
  return {
    ...question,
    options,
    correctAnswer: options.indexOf(correctValue),
  };
}

/**
 * Prepara perguntas:
 * - filtra por difficulty se passada
 * - embaralha perguntas
 * - limita a `amount` se passada
 * - embaralha opções de cada pergunta
 */
function prepareQuestions(allQuestions: any[], difficulty?: string, amount?: number) {
  let pool = allQuestions;
  if (difficulty) {
    pool = allQuestions.filter((q) => q.difficulty === difficulty);
    // se não houver perguntas do nível escolhido, usamos todas para evitar erro
    if (pool.length === 0) pool = allQuestions;
  }
  const shuffled = shuffleArray(pool);
  const selected = typeof amount === "number" ? shuffled.slice(0, amount) : shuffled;
  return selected.map((q) => shuffleOptions(q));
}

// ----------------------------- COMPONENT ------------------------------

type AnimationState = "idle" | "attack" | "hit" | "victory";

export default function QuizGame() {
  // preservei todos os estados que você já tinha
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerLife, setPlayerLife] = useState(100);
  const [opponentLife, setOpponentLife] = useState(100);
  const [maxLife] = useState(100);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<"default" | "correct" | "incorrect">("default");
  const [playerAnimation, setPlayerAnimation] = useState<AnimationState>("idle");
  const [opponentAnimation, setOpponentAnimation] = useState<AnimationState>("idle");
  const [questionVisible, setQuestionVisible] = useState(true);
  const [timerReset, setTimerReset] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(0);

  // NOVO: estado que contém o conjunto de perguntas ativas para a partida
  // Inicializo com MOCK_QUESTIONS para compatibilidade caso o jogo use antes de 'start'
  const [currentQuestions, setCurrentQuestions] = useState<any[]>(MOCK_QUESTIONS ?? []);

  // número de perguntas por partida — você pode ajustar ou derivar da difficulty
  const QUESTIONS_PER_GAME = 100;

  // Segurança: se currentQuestions estiver vazio (antes de iniciar), evitamos crash
  const currentQuestion = currentQuestions.length > 0 ? currentQuestions[currentQuestionIndex] : null;
  const progress = currentQuestions.length > 0 ? ((currentQuestionIndex + 1) / currentQuestions.length) * 100 : 0;

  // ------------------- Funções de controle do jogo -------------------

  // handleStart existente: agora prepara as perguntas e inicia o jogo
  const handleStart = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty);
    setPlayerLife(100);
    setOpponentLife(100);

    // Prepara perguntas conforme dificuldade e quantidade
    const prepared = prepareQuestions(MOCK_QUESTIONS, selectedDifficulty, QUESTIONS_PER_GAME);
    setCurrentQuestions(prepared);

    // Reset de estados de jogo
    resetGame();
    setGameState("playing");
    setQuestionStartTime(Date.now());
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setCurrentStreak(0);
    setSelectedAnswer(null);
    setAnswerState("default");
    setPlayerAnimation("idle");
    setOpponentAnimation("idle");
    setQuestionVisible(true);
    setTimerPaused(false);
    setQuestionStartTime(Date.now());
  };

  // Quando reiniciar do modal, queremos re-randomizar com a mesma difficulty atual
  const handleRestart = () => {
    setGameState("start");
    setPlayerLife(100);
    setOpponentLife(100);
    resetGame();

    // re-randomiza perguntas para a próxima partida (mantendo dificuldade atual)
    const prepared = prepareQuestions(MOCK_QUESTIONS, difficulty, QUESTIONS_PER_GAME);
    setCurrentQuestions(prepared);
  };

  const handleClose = () => {
    setGameState("start");
    setPlayerLife(100);
    setOpponentLife(100);
    // manter perguntas como estão (não altera)
  };

  // -------------------- Resposta do jogador --------------------

  const handleAnswer = (answerIndex: number) => {
    if (!currentQuestion) return;
    if (selectedAnswer !== null) return;

    setTimerPaused(true);
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    const timeTaken = (Date.now() - questionStartTime) / 1000;

    if (isCorrect) {
      setAnswerState("correct");
      setCorrectAnswers((prev) => prev + 1);
      setCurrentStreak(setCurrentStreak);

      // cálculo de dano conforme tempo (mantive sua lógica)
      let damage = 3;

      if (timeTaken < 3) {
        damage = 10;   // muito rápido
      } else if (timeTaken >= 3 && timeTaken < 5) {
        damage = 6;    // rápido
      } else if (timeTaken >= 5 && timeTaken < 8) {
        damage = 4;    // médio
      } else if (timeTaken >= 8 && timeTaken <= 10) {
        damage = 3;    // lento
      }

      const points = 100 + currentStreak * 10 + Math.floor((10 - timeTaken) * 10);
      setScore((prev) => prev + points);

      setQuestionVisible(false);
      setTimeout(() => setPlayerAnimation("attack"), 200);
      setTimeout(() => setOpponentAnimation("hit"), 600);
      setTimeout(() => {
        setOpponentLife((prev) => Math.max(0, prev - damage));
        setPlayerAnimation("idle");
        setOpponentAnimation("idle");
      }, 1000);
    } else {
      setAnswerState("incorrect");
      setCurrentStreak((prev) => prev + 1);

      setTimeout(() => setOpponentAnimation("attack"), 200);
      setTimeout(() => setPlayerAnimation("hit"), 400);
      setTimeout(() => {
        setPlayerLife((prev) => Math.max(0, prev - 10));
        setPlayerAnimation("idle");
        setOpponentAnimation("idle");
      }, 800);
    }

    // avançar para próxima pergunta usando currentQuestions.length
    setTimeout(() => {
      setCurrentQuestionIndex((prev) =>
        currentQuestions.length > 0 ? (prev + 1) % currentQuestions.length : prev
      );
      setSelectedAnswer(null);
      setAnswerState("default");
      setQuestionVisible(true);
      setTimerReset((prev) => !prev);
      setTimerPaused(false);
      setQuestionStartTime(Date.now());
    }, 1800);
  };

  // -------------------- Timeout --------------------

  const handleTimeout = () => {
    if (!currentQuestion) return;
    if (selectedAnswer !== null) return;

    setTimerPaused(true);
    setCurrentStreak(0);

    setTimeout(() => setOpponentAnimation("attack"), 200);
    setTimeout(() => setPlayerAnimation("hit"), 400);
    setTimeout(() => {
      setPlayerLife((prev) => Math.max(0, prev - 10));
      setPlayerAnimation("idle");
      setOpponentAnimation("idle");
    }, 800);

    setTimeout(() => {
      setCurrentQuestionIndex((prev) =>
        currentQuestions.length > 0 ? (prev + 1) % currentQuestions.length : prev
      );
      setSelectedAnswer(null);
      setAnswerState("default");
      setQuestionVisible(true);
      setTimerReset((prev) => !prev);
      setTimerPaused(false);
      setQuestionStartTime(Date.now());
    }, 1800);
  };

  // -------------------- Efeitos --------------------

  useEffect(() => {
    if (playerLife <= 0) {
      setTimerPaused(true);
      setTimeout(() => setGameState("gameover"), 1000);
    } else if (opponentLife <= 0) {
      setTimerPaused(true);
      setPlayerAnimation("victory");
      setTimeout(() => setGameState("gameover"), 1500);
    }
  }, [playerLife, opponentLife]);

  // -------------------- Render --------------------

  if (gameState === "start") {
    return <StartScreen onStart={handleStart} />;
  }

  if (!currentQuestion) {
    // segurança caso currentQuestions ainda não esteja pronto
    return (
      <div className="min-h-screen p-4">
        <p>Carregando perguntas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-1 bg-gradient-to-b from-background via-background to-muted/10">
      <div className="max-w-6xl mx-auto pt-8">
        <Progress value={progress} className="mb-8 h-2" data-testid="progress-quiz" />

        <BattleArena
          playerLife={playerLife}
          opponentLife={opponentLife}
          maxLife={maxLife}
          playerAnimation={playerAnimation}
          opponentAnimation={opponentAnimation}
        />

        <div className="mt-2 mb-1">
          <QuestionCard
            question={currentQuestion.question}
            roundNumber={currentQuestionIndex + 1}
            totalRounds={currentQuestions.length}
            isVisible={questionVisible}
          />
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          <ScoreDisplay
            correctAnswers={correctAnswers}
            currentStreak={currentStreak}
            totalScore={score}
          />

          <Timer
            duration={10}
            onTimeout={handleTimeout}
            isPaused={timerPaused}
            reset={timerReset}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option: string, index: number) => (
              <AnswerButton
                key={index}
                text={option}
                onClick={() => handleAnswer(index)}
                state={
                  selectedAnswer === null
                    ? "default"
                    : selectedAnswer === index
                    ? answerState
                    : "default"
                }
                disabled={selectedAnswer !== null}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>

      <GameOverModal
        isOpen={gameState === "gameover"}
        isVictory={opponentLife <= 0}
        finalScore={score}
        correctAnswers={correctAnswers}
        totalQuestions={currentQuestions.length}
        onRestart={handleRestart}
        onClose={handleClose}
      />
    </div>
  );
}
