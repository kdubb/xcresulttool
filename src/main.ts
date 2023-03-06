import * as artifact from '@actions/artifact'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as os from 'os'
import * as path from 'path'
import {Formatter} from './formatter'
import {glob} from 'glob'
import {promises} from 'fs'
const {stat} = promises

async function run(): Promise<void> {
  try {
    const inputPaths = core.getMultilineInput('path')
    const showPassedTests = core.getBooleanInput('show-passed-tests')
    const showCodeCoverage = core.getBooleanInput('show-code-coverage')
    let uploadBundles = core.getInput('upload-bundles').toLowerCase()
    if (uploadBundles === 'true') {
      uploadBundles = 'always'
    } else if (uploadBundles === 'false') {
      uploadBundles = 'never'
    }

    const bundlePaths: string[] = []
    for (const checkPath of inputPaths) {
      try {
        await stat(checkPath)
        bundlePaths.push(checkPath)
      } catch (error) {
        core.error((error as Error).message)
      }
    }
    let bundlePath = path.join(os.tmpdir(), 'Merged.xcresult')
    if (inputPaths.length > 1) {
      await mergeResultBundle(bundlePaths, bundlePath)
    } else {
      const inputPath = inputPaths[0]
      await stat(inputPath)
      bundlePath = inputPath
    }

    const formatter = new Formatter(bundlePath)
    const report = await formatter.format({
      showPassedTests,
      showCodeCoverage
    })

    await core.summary
      .addHeading(core.getInput('title'))
      .addRaw('\n')
      .addRaw(report.reportSummary)
      .addSeparator()
      .addRaw('\n')
      .addRaw(report.reportDetail)
      .write()

    if (core.getInput('token')) {
      if (
        uploadBundles === 'always' ||
        (uploadBundles === 'failure' && report.testStatus === 'failure')
      ) {
        for (const uploadBundlePath of inputPaths) {
          try {
            await stat(uploadBundlePath)
          } catch (error) {
            continue
          }

          const artifactClient = artifact.create()
          const artifactName = path.basename(uploadBundlePath)

          const rootDirectory = uploadBundlePath
          const options = {
            continueOnError: false
          }

          glob(`${uploadBundlePath}/**/*`, async (error, files) => {
            if (error) {
              core.error(error)
            }
            if (files.length) {
              await artifactClient.uploadArtifact(
                artifactName,
                files,
                rootDirectory,
                options
              )
            }
          })
        }
      }
    }
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()

async function mergeResultBundle(
  inputPaths: string[],
  outputPath: string
): Promise<void> {
  const args = ['xcresulttool', 'merge']
    .concat(inputPaths)
    .concat(['--output-path', outputPath])
  const options = {
    silent: true
  }

  await exec.exec('xcrun', args, options)
}
