import { EditorContentContext } from '@/contexts/EditorContentContext'
import JSZip from 'jszip'
import { Upload } from 'lucide-react'
import { useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { DropdownMenuItem } from '../ui/dropdown-menu'

export function ImportZip() {
  const { t } = useTranslation()
  const { handleValueChange } = useContext(EditorContentContext)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImportZip(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.name.endsWith('.zip')) {
      alert(t('import.error.invalidFile'))
      return
    }

    try {
      const zip = new JSZip()
      const contents = await zip.loadAsync(file)

      let hasValidFiles = false

      // Check for index.html and extract it
      const htmlFile = contents.file('index.html')
      if (htmlFile) {
        const htmlContent = await htmlFile.async('text')
        // Remove script and link tags that reference index.js and index.css
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlContent, 'text/html')

        // Remove script tag with src="./index.js"
        const scripts = doc.querySelectorAll('script[src="./index.js"]')
        for (const script of scripts) {
          script.remove()
        }

        // Remove link tag with href="./index.css"
        const links = doc.querySelectorAll('link[href="./index.css"]')
        for (const link of links) {
          link.remove()
        }

        // Save the entire HTML document (doctype will be added during export)
        const htmlToSave = doc.documentElement.outerHTML
        await handleValueChange('html', htmlToSave)
        hasValidFiles = true
      }

      // Check for index.css and extract it
      const cssFile = contents.file('index.css')
      if (cssFile) {
        const cssContent = await cssFile.async('text')
        await handleValueChange('css', cssContent)
        hasValidFiles = true
      }

      // Check for index.js and extract it
      const jsFile = contents.file('index.js')
      if (jsFile) {
        const jsContent = await jsFile.async('text')
        await handleValueChange('javascript', jsContent)
        hasValidFiles = true
      }

      // Check for index.md and extract it
      const mdFile = contents.file('index.md')
      if (mdFile) {
        const mdContent = await mdFile.async('text')
        await handleValueChange('markdown', mdContent)
        hasValidFiles = true
      }

      if (!hasValidFiles) {
        alert(t('import.error.missingFiles'))
        return
      }

      alert(t('import.success'))
    } catch (error) {
      console.error('Error importing zip:', error)
      alert(t('import.error.readError'))
    }

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleClick() {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleImportZip}
        style={{ display: 'none' }}
      />
      <DropdownMenuItem onClick={handleClick}>
        <Upload className="mr-1 size-3" />
        {t('import.trigger')}
      </DropdownMenuItem>
    </>
  )
}
