# 骰匠 · 夜市皮影骰宝

夜市皮影戏台上的骰子构筑肉鸽。三颗骰子、扣骰重掷、按骰宝牌型计分（筹 × 倍），
用刻刀铭刻骰面，收集法器，选择命格，六幕十八场赢下命运之匠；通关后可「加演」无尽挑战，
并解锁「加注」「豪赌」两档难度。

## 运行

```bash
npm install
npm run dev
```

- `npm test`：核心逻辑测试
- `npm run sim -- 400 0`：启发式机器人跑 400 局（第二个参数为难度 0/1/2），输出胜率、头牌击杀率、法器胜率
- `npm run build`：打包到 `dist/`（纯静态、相对路径，可放在任意子目录）
- `node scripts/make-icons.mjs`：重新生成应用图标

## 发布到 GitHub Pages

仓库自带自动部署（`.github/workflows/deploy.yml`）：每次推送到 `main`，GitHub 会自动测试、打包并发布。

1. 在 GitHub 新建一个空仓库，例如 `dice-smith`（不要勾选添加 README）。
2. 在本地项目目录里推送：

   ```bash
   git branch -M main
   git remote add origin https://github.com/你的用户名/dice-smith.git
   git push -u origin main
   ```

3. 打开仓库 **Settings → Pages**，在 *Build and deployment* 的 *Source* 选 **GitHub Actions**。
4. 到 **Actions** 页等「Deploy to GitHub Pages」跑完（约一两分钟），游戏就在
   `https://你的用户名.github.io/dice-smith/`。

之后改了代码，`git push` 一次就会自动更新网站。

也可以用其他静态托管（Netlify / Vercel / Cloudflare Pages）：构建命令 `npm run build`，发布目录 `dist`。
已使用相对路径，放在任意子目录都能运行；已包含 PWA 清单，手机可「添加到主屏幕」。

## 结构

- `src/core/`：纯逻辑，可种子复现（判牌、计分管线、法器、刻刀、命格、戒律、集市、难度、加演）
- `src/ui/`：Preact 界面；`dice3d/` three.js 骰桌；`puppet/` 参数化皮影；`scene/` 夜市与戏台；
  `coach.tsx` 班主提点；`audio.ts` 合成锣鼓与丝竹；`storage.ts` 安全存储
- `docs/design.md`：设计文档；`docs/review.md`：评测与改进记录
- `.github/workflows/deploy.yml`：GitHub Pages 自动部署
