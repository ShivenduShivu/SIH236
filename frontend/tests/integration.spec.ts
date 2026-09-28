import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function example(page:Page,name:string) {
  await page.goto('/')
  await page.getByRole('button',{name:new RegExp(name)}).click()
  await page.getByRole('button',{name:'Continue',exact:true}).click()
  await page.getByRole('button',{name:'Continue',exact:true}).click()
}
async function finish(page:Page) {
  await page.getByRole('button',{name:'Build my packaging plan'}).click()
  await expect(page.getByRole('tab',{name:'The plan',exact:true})).toBeVisible()
}

test('bulk tomatoes respect the 38-hour journey without a fake film specification',async({page})=>{
  await example(page,'Tomatoes to the market');await finish(page)
  await expect(page.getByRole('heading',{name:'Ventilated reusable crate',exact:true}).first()).toBeVisible()
  await expect(page.getByText(/100 kg total · 38 hours/)).toBeVisible()
  await page.getByRole('button',{name:'Add 12 travel hours'}).click()
  await expect(page.getByText(/100 kg total · 50 hours/)).toBeVisible()
  await page.getByRole('tab',{name:'Calculations'}).click()
  await expect(page.getByText('Total journey requirement',{exact:true})).toBeVisible()
  await expect(page.getByText('O2 permeance at peak stage',{exact:true})).toHaveCount(0)
})

test('dry-food budget changes with duration and exposes illustrative assumptions',async({page})=>{
  await example(page,'A crisp, dry snack');await finish(page)
  await expect(page.getByText('1.11',{exact:true})).toBeVisible()
  await expect(page.getByText('23.81',{exact:true})).toBeVisible()
  await expect(page.getByText(/illustrative examples, not measured thresholds/)).toBeVisible()
  await page.getByRole('button',{name:'Add 12 travel hours'}).click()
  await expect(page.getByText('1.09',{exact:true})).toBeVisible()
  await expect(page.getByText('23.42',{exact:true})).toBeVisible()
})

test('exhausted oxygen budget gives a visible infeasible result',async({page})=>{
  await example(page,'A crisp, dry snack')
  await page.getByLabel('Initial oxygen in the pack').fill('13')
  await finish(page)
  await expect(page.getByText('This budget needs to change',{exact:true})).toBeVisible()
  await expect(page.getByText('The current exposure budget cannot be met.',{exact:true})).toBeVisible()
  await expect(page.getByText('Maximum O2 permeance budget',{exact:true})).toHaveCount(0)
})

test('save, reload, reopen and delete preserve user control',async({page},info)=>{
  await example(page,'Broccoli, kept cool');await finish(page)
  await page.getByRole('button',{name:'Save plan',exact:true}).click()
  await expect(page.getByRole('button',{name:'Saved in this browser'})).toBeDisabled()
  await page.reload()
  await expect(page.getByRole('heading',{name:/Your harvest/})).toBeVisible()
  if(info.project.name==='desktop')await page.locator('.site-header').getByRole('button',{name:/Saved plans/}).click()
  else await page.locator('.mobile-nav').getByRole('button',{name:'Saved plans',exact:true}).click()
  await expect(page.getByRole('heading',{name:'1 saved plan',exact:true})).toBeVisible()
  await page.locator('.saved-main').click()
  await expect(page.getByText('20,000–22,500',{exact:true})).toBeVisible()
  if(info.project.name==='desktop')await page.locator('.site-header').getByRole('button',{name:/Saved plans/}).click()
  else await page.locator('.mobile-nav').getByRole('button',{name:'Saved plans',exact:true}).click()
  await page.getByRole('button',{name:'Delete Broccoli, kept cool'}).click()
  await expect(page.getByRole('heading',{name:'0 saved plans',exact:true})).toBeVisible()
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('packora.plans.v1')??'[]'))).toEqual([])
})

test('JSON export is reproducible and imports back into the editor',async({page,request},info)=>{
  await example(page,'Broccoli, kept cool');await finish(page)
  const dl=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();const file=await dl
  const exportPath=`../tmp/exports/${info.project.name}-scenario.json`;await file.saveAs(exportPath)
  const content=await readFile(exportPath,'utf8'),data=JSON.parse(content)
  const r=await request.post('/api/evaluate',{data:data.scenario})
  expect((await r.json()).fingerprint).toBe(data.fingerprint)
  await page.getByRole('button',{name:'Packora workspace'}).click()
  await page.getByRole('button',{name:'Import JSON',exact:true}).click()
  await page.getByLabel('Scenario JSON').fill(content)
  await page.getByRole('button',{name:'Validate & review'}).click()
  await expect(page.getByLabel('Give this plan a name')).toHaveValue('Broccoli, kept cool')
  await expect(page.getByLabel('Weight in one pack')).toHaveValue('0.5')
})

test('printable report includes assumptions, sources and input provenance',async({page,context},info)=>{
  await example(page,'A crisp, dry snack');await finish(page)
  const dl=page.waitForEvent('download');await page.getByRole('button',{name:'Printable report'}).click();const file=await dl
  const exportPath=`../tmp/exports/${info.project.name}-report.html`;await file.saveAs(exportPath)
  const content=await readFile(exportPath,'utf8')
  expect(content).toContain('Scenario fingerprint');expect(content).toContain('illustrative');expect(content).toContain('Maximum WVTR budget')
  const report=await context.newPage();await report.setContent(content);await report.emulateMedia({media:'print'})
  await expect(report.getByRole('heading',{name:'A crisp, dry snack',exact:true})).toBeVisible()
  await expect(report.getByRole('heading',{name:'Sources',exact:true})).toBeVisible()
  await report.screenshot({path:`../tmp/screenshots/${info.project.name}-print-report.png`,fullPage:true});await report.close()
})

test('malformed imports show actionable errors and remain editable',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Import JSON',exact:true}).click()
  await page.getByLabel('Scenario JSON').fill('{"commodity":"mango"}')
  await page.getByRole('button',{name:'Validate & review'}).click()
  await expect(page.getByRole('alert')).toContainText('commodity')
  await page.getByRole('button',{name:'Insert example'}).click()
  await page.getByRole('button',{name:'Validate & review'}).click()
  await expect(page.getByRole('heading',{name:'What are you packing?'})).toBeVisible()
})

test('typed Hindi description is reviewed without invented missing values',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Speak your requirements'}).click()
  await page.getByLabel('Your description').fill('१०० किलो टमाटर, १२ घंटे, २५ डिग्री')
  await expect(page.getByText('100 kg',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Review these details'}).click()
  await expect(page.getByLabel('Total shipment weight')).toHaveValue('100')
  await expect(page.getByLabel('Tomato maturity')).toHaveValue('unknown')
  await page.getByRole('button',{name:'Continue',exact:true}).click()
  await expect(page.getByLabel('On the road duration')).toHaveValue('12')
  await expect(page.getByLabel('On the road temperature')).toHaveValue('25')
  await expect(page.getByLabel('Pack & wait temperature')).toHaveValue('')
})

test('manual flow returns missing-data checks instead of pretending certainty',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Plan a new journey'}).click()
  await page.getByLabel('Total shipment weight').fill('50')
  await page.getByRole('button',{name:'Continue',exact:true}).click()
  await page.getByLabel('On the road duration').fill('12')
  await page.getByRole('button',{name:'Continue',exact:true}).click();await finish(page)
  await expect(page.getByText('A few details need checking',{exact:true})).toBeVisible()
  await expect(page.getByText('Tomato maturity is not confirmed.',{exact:true})).toBeVisible()
  await expect(page.getByText('Temperature is unknown for: On the road',{exact:true})).toBeVisible()
})

test('failed service shows an error and a retry succeeds',async({page})=>{
  await example(page,'Broccoli, kept cool')
  await page.route('**/api/evaluate',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({detail:'Test service unavailable. Please retry.'})}))
  await page.getByRole('button',{name:'Build my packaging plan'}).click()
  await expect(page.getByRole('alert')).toContainText('Test service unavailable')
  await expect(page.getByRole('button',{name:'Build my packaging plan'})).toBeEnabled()
  await page.unroute('**/api/evaluate');await finish(page)
  await expect(page.getByText('20,000–22,500',{exact:true})).toBeVisible()
})

test('stale what-if response cannot overwrite newly edited input',async({page})=>{
  await example(page,'Broccoli, kept cool');await finish(page)
  let release:()=>void=()=>{};const blocked=new Promise<void>(resolve=>release=resolve)
  await page.route('**/api/evaluate',async route=>{const response=await route.fetch();await blocked;await route.fulfill({response})})
  await page.getByRole('button',{name:'Travel at 20 °C'}).click()
  await expect(page.getByText('Recalculating the changed scenario…',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Edit inputs'}).click()
  await page.getByLabel('Give this plan a name').fill('Keep my new edit')
  const response=page.waitForResponse('**/api/evaluate');release();await response
  await expect(page.getByRole('heading',{name:'What are you packing?'})).toBeVisible()
  await expect(page.getByLabel('Give this plan a name')).toHaveValue('Keep my new edit')
})

test('one-stage import disables transit modification and does not crash',async({page,request})=>{
  const ex=(await (await request.get('/api/examples')).json())[1].scenario
  ex.stages=[ex.stages[0]]
  await page.goto('/');await page.getByRole('button',{name:'Import JSON',exact:true}).click()
  await page.getByLabel('Scenario JSON').fill(JSON.stringify(ex));await page.getByRole('button',{name:'Validate & review'}).click()
  await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();await finish(page)
  await expect(page.getByRole('button',{name:'Add 12 travel hours'})).toBeDisabled()
  await expect(page.getByRole('button',{name:'Travel at 20 °C'})).toHaveCount(0)
})
