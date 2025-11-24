/**
 * Create Website Command
 *
 * Scaffolds a complete website with:
 * - Astro 5 + React 19
 * - Tailwind CSS v4
 * - shadcn/ui components
 * - Configured with organization branding
 */
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import { isReservedName, isReservedFolder, isReservedWebsite, isValidUrl, } from '../utils/validation.js';
const execAsync = promisify(exec);
export async function createWebsite(options = {}) {
    console.log(chalk.bold.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold.cyan('   ONE Platform Website Builder'));
    console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    try {
        // Step 1: Collect information
        const { orgName, orgWebsite, directory, backendEnabled } = await collectWebsiteInfo(options);
        // Step 2: Clone web template
        await cloneWebTemplate(directory);
        // Step 3: Configure environment
        await configureEnvironment(directory, {
            orgName,
            orgWebsite,
            orgFolder: directory,
            backendEnabled,
        });
        // Step 4: Install dependencies
        await installDependencies(directory);
        // Step 5: Show success message
        showSuccessMessage(directory, orgName);
    }
    catch (error) {
        console.error(chalk.red('\n✗ Website creation failed:'), error.message);
        process.exit(1);
    }
}
async function collectWebsiteInfo(options) {
    console.log(chalk.bold('Step 1: Organization Information\n'));
    // Organization name
    let orgName = options.orgName;
    if (!orgName) {
        const { name } = await prompts({
            type: 'text',
            name: 'name',
            message: 'Organization name?',
            validate: (value) => {
                if (!value)
                    return 'Organization name is required';
                if (isReservedName(value)) {
                    return 'Organization name "one" is reserved for ONE Platform';
                }
                return true;
            },
        });
        if (!name) {
            throw new Error('Organization name is required');
        }
        orgName = name;
    }
    // Organization website
    let orgWebsite = options.orgWebsite;
    if (!orgWebsite) {
        const { website } = await prompts({
            type: 'text',
            name: 'website',
            message: 'Organization website?',
            initial: `https://${orgName.toLowerCase().replace(/\s+/g, '')}.com`,
            validate: (value) => {
                if (!value)
                    return 'Website is required';
                if (!isValidUrl(value))
                    return 'Please enter a valid URL';
                if (isReservedWebsite(value)) {
                    return 'Website "one.ie" is reserved for ONE Platform';
                }
                return true;
            },
        });
        if (!website) {
            throw new Error('Organization website is required');
        }
        orgWebsite = website;
    }
    // Directory name
    let directory = options.directory;
    if (!directory) {
        const { dir } = await prompts({
            type: 'text',
            name: 'dir',
            message: 'Directory name?',
            initial: orgName.toLowerCase().replace(/\s+/g, '-'),
            validate: (value) => {
                if (!value)
                    return 'Directory name is required';
                if (isReservedFolder(value)) {
                    return 'Directory name "onegroup" is reserved';
                }
                if (fs.existsSync(value)) {
                    return `Directory "${value}" already exists`;
                }
                return true;
            },
        });
        if (!dir) {
            throw new Error('Directory name is required');
        }
        directory = dir;
    }
    // Backend enabled
    let backendEnabled = options.backendEnabled;
    if (backendEnabled === undefined) {
        const { backend } = await prompts({
            type: 'select',
            name: 'backend',
            message: 'Enable backend features?',
            choices: [
                {
                    title: 'Frontend only (recommended for start)',
                    description: 'Static site, no database, deploy anywhere',
                    value: false,
                },
                {
                    title: 'Full platform (backend enabled)',
                    description: 'Real-time database, auth, Convex backend',
                    value: true,
                },
            ],
            initial: 0,
        });
        backendEnabled = backend ?? false;
    }
    return { orgName, orgWebsite, directory, backendEnabled };
}
async function cloneWebTemplate(directory) {
    console.log(chalk.bold('\nStep 2: Downloading Website Template\n'));
    const spinner = ora('Cloning web template...').start();
    try {
        // Clone from ONE web repository
        await execAsync(`git clone --depth 1 https://github.com/one-ie/web.git "${directory}"`, { stdio: 'ignore' });
        // Remove .git directory (user will initialize their own)
        await fs.remove(path.join(directory, '.git'));
        spinner.succeed('Template downloaded');
    }
    catch (error) {
        spinner.fail('Failed to clone template');
        throw error;
    }
}
async function configureEnvironment(directory, config) {
    console.log(chalk.bold('\nStep 3: Configuring Environment\n'));
    const spinner = ora('Creating .env.local...').start();
    try {
        const envPath = path.join(directory, '.env.local');
        // Read example template
        const examplePath = path.join(directory, '.env.local.example');
        let envContent = '';
        if (await fs.pathExists(examplePath)) {
            envContent = await fs.readFile(examplePath, 'utf-8');
            // Replace placeholders
            envContent = envContent
                .replace(/ORG_NAME=.*/g, `ORG_NAME=${config.orgName}`)
                .replace(/ORG_WEBSITE=.*/g, `ORG_WEBSITE=${config.orgWebsite}`)
                .replace(/ORG_FOLDER=.*/g, `ORG_FOLDER=${config.orgFolder}`)
                .replace(/ONE_BACKEND=.*/g, `ONE_BACKEND=${config.backendEnabled ? 'on' : 'off'}`);
        }
        else {
            // Create from scratch
            envContent = `# Organization Configuration
ORG_NAME=${config.orgName}
ORG_WEBSITE=${config.orgWebsite}
ORG_FOLDER=${config.orgFolder}
ONE_BACKEND=${config.backendEnabled ? 'on' : 'off'}

# Backend Configuration (only needed if ONE_BACKEND=on)
# PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
# CONVEX_DEPLOYMENT=prod:your-deployment-name
`;
        }
        await fs.writeFile(envPath, envContent, 'utf-8');
        spinner.succeed('Environment configured');
    }
    catch (error) {
        spinner.fail('Failed to configure environment');
        throw error;
    }
}
async function installDependencies(directory) {
    console.log(chalk.bold('\nStep 4: Installing Dependencies\n'));
    const spinner = ora('Running bun install...').start();
    try {
        await execAsync('bun install', {
            cwd: directory,
        });
        spinner.succeed('Dependencies installed');
    }
    catch (error) {
        spinner.fail('Failed to install dependencies');
        console.log(chalk.yellow('\n⚠ You can install manually later with: bun install'));
    }
}
function showSuccessMessage(directory, orgName) {
    console.log(chalk.bold.green('\n✓ Website created successfully!\n'));
    console.log(chalk.bold('Next steps:\n'));
    console.log(chalk.cyan(`  cd ${directory}`));
    console.log(chalk.cyan('  bun run dev'));
    console.log();
    console.log(chalk.dim('  Then visit http://localhost:4321'));
    console.log();
    console.log(chalk.bold('What you got:\n'));
    console.log(`  ${chalk.green('✓')} Astro 5 + React 19`);
    console.log(`  ${chalk.green('✓')} Tailwind CSS v4`);
    console.log(`  ${chalk.green('✓')} shadcn/ui components (50+)`);
    console.log(`  ${chalk.green('✓')} Branded for "${orgName}"`);
    console.log(`  ${chalk.green('✓')} Ready to deploy to Cloudflare Pages`);
    console.log();
    console.log(chalk.bold('Deploy when ready:\n'));
    console.log(chalk.cyan('  bun run build'));
    console.log(chalk.cyan('  wrangler pages deploy dist --project-name=your-project'));
    console.log();
    console.log(chalk.dim('Documentation: https://one.ie'));
    console.log();
}
//# sourceMappingURL=create-website.js.map