---
title: 项目开发流程管理：Git 分支策略与提交纪律
date: 2026-08-02
description: 一个人的项目也值得有流程。分支怎么开、提交怎么写、历史怎么保持可读，以及哪些命令应该被列进黑名单。
category: 技术博客
tags: [Git, 工程实践, 开发流程, 版本控制]
---

大部分关于 Git 的教程都在讲命令怎么敲，很少讲什么时候该敲。这篇是后者——一套我自己在用的流程约定，单人项目和小团队都适用。

## 主干必须是可发布的

唯一一条不能破的规则：`main` 上的任意一个提交，checkout 出来都应该能构建、能跑。

推论是所有工作都在分支上进行，包括改一个错别字。这听起来啰嗦，但收益在于——任何时候出问题，回到 `main` 就是安全状态，不需要判断「现在的 main 是不是半成品」。

```bash
# 从最新的 main 开分支
git switch main
git pull
git switch -c feat/pagination
```

分支命名用前缀区分意图，扫一眼分支列表就知道每条线在干什么：

- `feat/` 新功能
- `fix/` 修 bug
- `refactor/` 不改行为的重构
- `docs/` 文档
- `chore/` 依赖升级、配置调整

## 提交信息写「为什么」，不写「改了什么」

改了什么，`git diff` 已经说得比你清楚。提交信息的价值在于记录 diff 里看不出来的东西。

反面例子：

```
修改了分页组件
更新代码
fix bug
```

三个月后看这样的历史，等于没有历史。

好一点的写法：

```
fix: 分页在最后一页显示空列表

总页数用 ceil 算，但切片用的是 floor，导致
posts.length 刚好是 PAGE_SIZE 整数倍时多生成一页。
```

标题一行说清做了什么，空一行，正文说清为什么。约定式提交（Conventional Commits）的前缀值得用，因为它能让 `git log --oneline` 直接读出变更性质。

## 一个提交只做一件事

判断标准很简单：这个提交能不能用一句话说完，且句子里不出现「并且」。

出现「并且」就该拆。拆分的价值在 `git bisect` 和 `git revert` 的时候才会显现——一个混了三件事的提交，revert 的时候你只能全撤或全留。

暂存区就是为拆分设计的：

```bash
git add -p          # 逐块选择要进这次提交的改动
git status          # 提交前确认一遍暂存了什么
```

不要习惯性 `git add .`。它是把不相关改动混进提交的主要原因，也是误提交 `.env` 的主要原因。

## 历史整理：什么时候可以改写

规则是：**没推出去的历史可以随便整理，推出去的不要碰。**

推送前把本地的 wip 提交整理干净是好习惯：

```bash
# 把本地未推送的提交压成有意义的几个
git rebase -i main
```

推送后就别 rebase 了。别人（或者另一台机器上的你）已经基于那段历史工作，改写会导致他们下次 pull 时冲突。

顺带说合并方式的选择：

| 方式 | 历史形态 | 适用 |
| --- | --- | --- |
| `merge --no-ff` | 保留分支拓扑，多一个合并提交 | 想看清功能边界 |
| `rebase` | 线性历史，无合并提交 | 单人项目，历史干净 |
| `squash merge` | 一个功能压成一个提交 | 分支上提交很碎 |

单人项目我用 rebase，历史是一条直线，`git log` 读起来像时间轴。协作项目我倾向 squash merge，因为别人分支上的 wip 提交对我没有信息量。

## 命令黑名单

这几条命令的共同点是：执行前不确认，事后不好救。

```bash
git push --force              # 覆盖远程历史，团队协作里的核弹
git reset --hard              # 丢弃工作区改动，且不进 reflog
git clean -fd                 # 删除未跟踪文件，包括你忘了 add 的新文件
git checkout .                # 静默丢弃所有未暂存改动
```

`--force` 如果非用不可，用 `--force-with-lease`：它会在远程有你没见过的提交时拒绝执行，相当于加了一道确认。

`reset --hard` 之前先 `git stash`。stash 是可以找回来的，`reset --hard` 丢掉的未暂存改动不在 reflog 里，基本没救。

## 出事之后

绝大多数「我把仓库搞坏了」的情况都能救，因为 reflog 记录了 HEAD 的每一次移动：

```bash
git reflog                    # 看 HEAD 去过哪里
git reset --hard HEAD@{3}     # 回到三步之前
```

reflog 默认保留 90 天。只要提交过，东西就还在，问题只是找不找得到。

## 值得配的几个别名

```bash
git config --global alias.st 'status --short --branch'
git config --global alias.lg "log --graph --oneline --decorate -20"
git config --global alias.last 'log -1 --stat'
git config --global alias.unstage 'restore --staged'
```

`lg` 是用得最多的一个。图形化的简洁历史能让分支结构一目了然，比翻 GUI 快。

## 收束

这套流程的核心其实只有三件事：主干永远可用、提交讲清为什么、别改写推出去的历史。剩下的都是这三件事的推论。

流程的意义不在于仪式感，而在于三个月后你还能读懂自己的历史，出问题时能快速定位到那个引入 bug 的提交。单人项目更需要——因为没有别人帮你记住当时在想什么。
