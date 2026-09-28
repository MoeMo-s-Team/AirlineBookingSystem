# Git & GitHub Quick Guide

---

## 1. SETUP

```bash
git clone <url>
cd AirlineBookingSystem
cp .env.example .env

# Backend
cd backend && mvn compile

# Frontend
cd ../frontend && pnpm install && pnpm build
```

---

## 2. DAILY WORKFLOW

```bash
# Bắt đầu ngày
git checkout feature/yourname/module
git pull origin main

# Trong ngày
git add .
git commit -m "feat: add booking endpoint"
git push origin feature/yourname/module
```

---

## 3. BRANCH

```bash
# Tạo branch mới
git checkout -b feature/hieu/flight

# Đổi branch
git checkout main
git checkout feature/yourname/module

# Branch naming: feature/name/module
```

---

## 4. COMMIT MESSAGE

```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: rewrite code
test: add tests
chore: build/config changes
```

**Ví dụ:**
```bash
git commit -m "feat(booking): add create booking endpoint"
git commit -m "fix(flight): correct search query"
```

---

## 5. SYNC & MERGE

```bash
# Cập nhật branch với main
git checkout main && git pull
git checkout feature/yourname/module
git rebase main
git push --force-with-lease origin feature/yourname/module

# Merge PR: dùng "Squash and merge" trên GitHub UI
```

---

## QUICK REF

| Command | Description |
|---------|-------------|
| `git status` | Xem thay đổi |
| `git diff` | Chi tiết thay đổi |
| `git stash` | Lưu tạm work |
| `git stash pop` | Lấy lại stash |
| `git log --oneline` | Lịch sử commits |
| `git reset --hard HEAD~1` | Xóa commit cuối |

---

## BRANCH STRUCTURE

```
main
└── feature/hieu/flight
└── feature/my/fare
└── feature/hien/booking
└── feature/member4/frontend
```

**KHÔNG push trực tiếp vào main! Luôn tạo PR để merge main**
