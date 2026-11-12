// 알파블록스 공식 채널(@officialalphablocks) 레벨별 풀 에피소드 합본 목록
// 이 목록에 있는 영상만 앱에서 재생됩니다.
export const LEVELS = [
  {
    id: 1,
    name: 'Red Level One',
    ko: '빨강 레벨',
    subtitle: 'Phonics First Steps',
    desc: '알파벳 음가와 CVC 3글자 단어',
    color: '#ef3b36',
    dark: '#b81f1b',
    light: '#ffd9d6',
    mascot: 'A',
    videos: [
      { id: 'B8Wf1EadpqE', ep: '1–3', dur: '11:59', titles: ['Alphablocks A-Z', 'Taps', 'In'], note: 'A~Z 음가, s a t p i n' },
      { id: 'EtWeUgRyb28', ep: '4–6', dur: '13:59', titles: ['Man', 'Din', 'Dog'], note: 'm d g o 음가와 단어 사슬' },
      { id: 'xTXnLNQjpIk', ep: '7–9', dur: '14:00', titles: ['Cat', 'Dot', 'Kick'], note: '단모음 a o, c k ck' },
      { id: 'ki7zcigVlKo', ep: '10–12', dur: '14:00', titles: ['Pen', 'Up', 'Red'], note: '단모음 e u, 자음 r' },
      { id: 'o9BaJmEQrmc', ep: '13–15', dur: '11:59', titles: ['Hen', 'Bop', 'Top'], note: '자음 h b, 단모음 복습' },
      { id: 'RNAJQjN2VPE', ep: '16–18', dur: '13:59', titles: ['Fred', 'Lips', 'Hill'], note: '자음 f l, 쌍자음 ll ss ff' },
    ],
  },
  {
    id: 2,
    name: 'Orange Level Two',
    ko: '주황 레벨',
    subtitle: 'Phonics Next Steps',
    desc: '나머지 음가 j v w x y z q, 워드패밀리',
    color: '#ff8a1f',
    dark: '#c95f00',
    light: '#ffe5cc',
    mascot: 'Z',
    videos: [
      { id: 'WMhNV50ekJ8', ep: '1–3', dur: '11:58', titles: ['Van', 'Party', 'Web'], note: '자음 j v w x' },
      { id: 'ZrGRs9QGmmk', ep: '4–6', dur: '14:00', titles: ['Wig', 'Rainbow', 'Zap'], note: '-ig -og 각운, y z zz' },
      { id: 'qfmBrkC4dKw', ep: '7–9', dur: '14:00', titles: ['Box', 'Quick', 'On'], note: '-ed 각운, qu, 음가 복습' },
      { id: 'xZVbQB4nuGc', ep: '10–12', dur: '14:00', titles: ['ABC', 'The Cat Sat on the Mat', 'Wish'], note: '알파벳 노래, -at -ug 각운' },
      { id: 'qrb2456moQE', ep: '13–15', dur: '13:59', titles: ['Snowman', 'Win', 'Hat'], note: '-an -in -ap 워드패밀리' },
      { id: '48kGZNk4cpU', ep: '16–17', dur: '09:25', titles: ['Little Red N', 'Odd'], note: '철자 바꾸기, 쌍자음 dd' },
    ],
  },
  {
    id: 3,
    name: 'Yellow Level Three',
    ko: '노랑 레벨',
    subtitle: 'Letter Teams',
    desc: '이중음자·삼중음자 ch sh th ai ee…',
    color: '#ffc81a',
    dark: '#c99600',
    light: '#fff3c4',
    mascot: 'E',
    videos: [
      { id: 'lSuC-At_Ozk', ep: '1–3', dur: '13:59', titles: ['Champ', 'Song', 'Thing'], note: '자음 팀 ch sh ng th' },
      { id: 'Wp3va0hNI4w', ep: '4–6', dur: '11:58', titles: ['Train', 'Sail', 'Beep'], note: '모음 팀 ai ee' },
      { id: 'UzuPWBRkCYE', ep: '7–9', dur: '13:59', titles: ['Tightrope', 'Toad', 'Book'], note: 'igh oa, 짧은 oo' },
      { id: 'Dynr1B1KKEw', ep: '10–12', dur: '09:59', titles: ['Moon', 'Hey!', 'Race'], note: '긴 oo, 모음 팀 복습' },
      { id: 'MfqlWu1fR_k', ep: '13–14', dur: '09:25', titles: ['Card', 'The End'], note: 'ar or ur er' },
      { id: 'x6o_ZuELahQ', ep: '15–16', dur: '09:25', titles: ['How Now Brown Cow', 'Fair'], note: 'ow oi ear air ure' },
    ],
  },
  {
    id: 4,
    name: 'Green Level Four',
    ko: '초록 레벨',
    subtitle: 'Letter Blends',
    desc: '자음군 blends, 4~5글자 단어',
    color: '#34b649',
    dark: '#1f8030',
    light: '#d4f5d9',
    mascot: 'G',
    videos: [
      { id: 'jYs8vju3GHk', ep: '1–3', dur: '09:57', titles: ['Sing', 'Band', 'Four'], note: '-nd -ng -nt -st, 4글자 단어' },
      { id: 'aMFlc-Ckbsw', ep: '4–6', dur: '13:59', titles: ['Dots', 'Frog on a Dog', 'Clap'], note: '복수형 -s, fr- cl- fl-' },
      { id: 'BXl8VrcCpK8', ep: '7–9', dur: '13:59', titles: ['Fit', 'Best', 'Prank'], note: 'sl- st- pr- tr-' },
      { id: 'Tp8AA9SlP10', ep: '10–11', dur: '09:25', titles: ['Ants', 'Ink'], note: '-nt sn- -nk' },
      { id: 'pVJe6N9oWb4', ep: '12–13', dur: '09:25', titles: ['Trap', 'Plusman'], note: 'tr- cr-, 복합어' },
    ],
  },
  {
    id: 5,
    name: 'Blue Level Five',
    ko: '파랑 레벨',
    subtitle: 'Long Vowels',
    desc: 'Magic E와 장모음 대체 철자',
    color: '#2b8cf0',
    dark: '#1560b3',
    light: '#d3e8ff',
    mascot: 'O',
    videos: [
      { id: 'Uc7WalzEi4c', ep: '1–3', dur: '11:59', titles: ['Alphabet', 'Name', 'Jaybird'], note: 'wh ph, a-e ay' },
      { id: 'rbuBNrz_GQU', ep: '4–6', dur: '09:59', titles: ['장모음 파트 1'], note: 'a-e ee ea' },
      { id: 'd7bpPpQWNNs', ep: '7–9', dur: '10:00', titles: ['장모음 파트 2'], note: 'i-e, 모음 y' },
      { id: '3DVx67LCBMk', ep: '10–12', dur: '09:59', titles: ['장모음 파트 3'], note: 'o-e ow' },
      { id: 'ym7NRosqbZQ', ep: '13–15', dur: '09:59', titles: ['장모음 파트 4'], note: 'u-e ue ew' },
      { id: '2AzIB_HXvsU', ep: '16–17', dur: '07:25', titles: ['Magic E 복습'], note: 'Magic E 종합, 심화 장모음' },
      { id: 'M6j-_I6PGV8', ep: '18–19', dur: '09:25', titles: ['Birthday Girl', 'Cowboy'], note: 'ir ur er, ou oy' },
    ],
  },
];

// 빠른 조회용
export const ALL_VIDEOS = LEVELS.flatMap((lv) =>
  lv.videos.map((v, i) => ({ ...v, level: lv.id, index: i }))
);
export const VIDEO_IDS = new Set(ALL_VIDEOS.map((v) => v.id));

export const thumb = (id, q = 'hqdefault') => `https://i.ytimg.com/vi/${id}/${q}.jpg`;
