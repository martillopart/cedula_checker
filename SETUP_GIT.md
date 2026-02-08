# Setup Git with Your GitHub Account

The commits were made with a placeholder account. Before pushing to GitHub, set up your real Git identity.

## Set Your Git Identity

Run these commands (replace with your actual GitHub username and email):

```powershell
# Set your name (use your GitHub username or real name)
git config --global user.name "Your Name"

# Set your email (use the email associated with your GitHub account)
git config --global user.email "your.email@example.com"
```

## Update Existing Commits (Optional)

If you want to change the author of the existing commits to your account:

```powershell
# This will rewrite the commit history with your identity
git filter-branch --env-filter '
OLD_EMAIL="deploy@cedula.local"
CORRECT_NAME="Your Name"
CORRECT_EMAIL="your.email@example.com"
if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

**Or simply leave them as-is** - they're just local commits. Once you push to GitHub, future commits will use your configured identity.

## Verify Your Configuration

```powershell
git config user.name
git config user.email
```

## Then Push to GitHub

After setting your identity, you can push:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/cedula.git
git branch -M main
git push -u origin main
```

---

**Note:** The placeholder commits are fine for now. GitHub will show your real identity for all future commits after you configure it.
