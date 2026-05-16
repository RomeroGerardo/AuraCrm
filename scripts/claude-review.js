import { Anthropic } from '@anthropic-ai/sdk';
import { execSync } from 'child_process';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function run() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️ No ANTHROPIC_API_KEY found, skipping AI security review.");
    return;
  }
  
  try {
    // Extraer diff contra main
    console.log('Fetching main branch to compare...');
    execSync('git fetch origin main');
    const diff = execSync('git diff origin/main').toString();
    
    if (!diff || diff.trim().length === 0) {
      console.log('✅ No changes found to review.');
      return;
    }
    
    console.log('🤖 Enviando diff a Claude para revisión de seguridad...');
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1500,
      system: "You are a DevSecOps expert. Review the following code diff for security vulnerabilities, OWASP top 10 issues, and secure coding best practices. Keep it concise. If no issues are found, say 'Looks good to me from a security perspective.'",
      messages: [{ role: "user", content: "Here is the diff:\n\n" + diff }],
    });
    
    console.log('\n=============================================');
    console.log('📝 REVISIÓN DE SEGURIDAD DE CLAUDE:');
    console.log('=============================================\n');
    console.log(response.content[0].text);
    console.log('\n=============================================');
    
  } catch (err) {
    console.error('❌ Error during AI review:', err);
    process.exit(1);
  }
}

run();
