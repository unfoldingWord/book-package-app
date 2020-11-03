import React from 'react';
import clsx from 'clsx';
import { withStyles, makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Popover from '@material-ui/core/Popover';

import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import Switch from '@material-ui/core/Switch';

import { green } from '@material-ui/core/colors';
import {BookPackageRollup} from 'book-package-rcl';
import * as books from '../src/core/books';
import * as opt from '../src/core/optimize';
import * as csv from '../src/core/exportBookPackage';
import * as exp from '../src/core/export';
import { Container, CssBaseline, Grid } from '@material-ui/core';

import * as dbsetup from 'book-package-rcl';

export function download(filename: string, text: string) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      flexGrow: 1,
      display: 'flex',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    title: {
      flexGrow: 1,
    },
    formControl: {
      margin: theme.spacing(3),
    },
    button: {
      marginRight: theme.spacing(1),
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
    alignItemsAndJustifyContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },  
    offset: {...theme.mixins.toolbar},
  }),
);

const GreenCheckbox = withStyles({
  root: {
    color: green[400],
    '&$checked': {
      color: green[600],
    },
  },
  checked: {},
})((props: CheckboxProps) => <Checkbox color="default" {...props} />);

function joinBookIds(state: opt.bpStateIF ) {
  const x = Object.keys(state);
  let y: string[] = [];
  for (let i=0; i<x.length; i++) {
    if ( state[x[i]][0] ) {
      y.push(books.bookIdByTitle(x[i]));
    }
  }
  return y.join();
}
  
    
function getSteps() {
  return ['Select Books', 'Book Package Details', 'Configure Book Package Flow', 'Optimized Flow'];
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return 'Select books, then click Next to generate book package details';
    case 1:
      return 'Click Next to configure book book package flow optimization';
    case 2:
      return 'Select any books completed, then click Next to optimize book package flow';
    case 3:
      return 'Optimized Book Package Flow';
    default:
      return 'Unknown step';
  }
}

// A custom hook that builds on useLocation to parse
// the query string for you.
let queryProcessedOnce = false;
function useQuery() {
  let search = window.location.search;
  //console.log("url=",window.location.origin,window.location.pathname)
  return new URLSearchParams(search);
}

export default function App() {
  const [state, setState] = React.useState({ ...books.titlesToBoolean() }); 
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  
  /* ----------------------------------------------------------
      Stepper
  */
  const steps = getSteps();

  const isStepOptional = (step: number) => {
    return false;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };


  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(prevSkipped => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
    let states = Object.keys(state);
    for( let i=0; i < states.length; i++) {
      state[states[i]][0] = false;
      state[states[i]][1] = false;
    }
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  let query = useQuery();
  if ( activeStep === 0 && queryProcessedOnce === false ) {
    queryProcessedOnce = true;
    let bks   = query.get("books");
    if ( bks !== null ) {
      // user has launched the app with URL query parameters
      let barrayIds = bks.split(',');
      let barrayTitles: string[] = [];
      for ( let i=0; i < barrayIds.length; i++ ) {
        let x = books.bookTitleById(barrayIds[i]);
        if ( x === "" ) {
          alert("Invalid Book Id:"+barrayIds[i]);
          break;
        }
        barrayTitles.push(x);
      }
      for( let i=0; i < barrayTitles.length; i++) {
        let name = barrayTitles[i];
        console.log("name:",name)
        // set the state variables
        state[name][0] = true;
        state[name][1] = false;
        let b: boolean[] = [];
        b[0] = true;
        b[1] = false;  
      }
      // skip to step 2...
      //activeStep = 1; //works sort of
      handleNext();
      // for URL, always clear local cache
      dbsetup.bpstore.clear();
    }
  }


  const classes = useStyles();
  const theme = useTheme();

  /* ----------------------------------------------------------
      Popover
  */
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const popen = Boolean(anchorEl);
  const id = popen ? 'simple-popover' : undefined;


  /* ----------------------------------------------------------
      Menu drawer
  */
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };


  async function handleExportDetails() {
    let data = await csv.exportBookPackage(state);
    let ts = new Date().toISOString();
    let fn = 'BookPackageDetails-' + ts + '.csv';
    download(fn, data);
  }

  const copyToClipboard = (str: string) => {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  async function handlePermalink(event: React.MouseEvent<HTMLButtonElement>) {
    const defBase = "https://unfoldingword.github.io/book-package-app/";
    let states = Object.keys(state);
    let ids: string[] = [];
    for( let i=0; i < states.length; i++) {
      let name = states[i];
      if ( state[name][0] === true ) {
        // get the id
        let id = books.bookIdByTitle(name);
        ids.push(id);
      }
    }
    // build up the URL
    const origin   = window.location.origin;
    const pathname = window.location.pathname;
    const qstring  = '?books=';
    let url = origin+pathname+qstring+ids.join(',');
    if ( origin.startsWith("file") ) {
      url = defBase+qstring+ids.join(',');
    }
    copyToClipboard(url);
    setAnchorEl(event.currentTarget);
  }
//http://localhost:3000/book-package-app/?books=gen,exo
  async function handleDeleteLocalCache() {
    dbsetup.bpstore.clear();
  }

  async function handleExportSummary() {
    let data = await exp.exportCounts(state);
    let ts = new Date().toISOString();
    let fn = 'BookPackageSummary-' + ts + '.csv';
    download(fn, data);
  }

  async function handleOptExportSummary() {
    let data = await dbsetup.bpstore.getItem('optimized-csv-data');
    let ts = new Date().toISOString();
    let fn = 'OptimizationFlow-' + ts + '.csv';
    download(fn, data);
  }

    const handleSelectNoneOt = () => {
    let states = books.oldTestament();
    for( let i=0; i < states.length; i++) {
      state[states[i]][0] = false;
      state[states[i]][1] = false;
      let name = states[i];
      let b: boolean[] = [];
      b[0] = false;
      b[1] = false;  
      setState({ ...state, [name]: b });
    }
  };

  const handleSelectAllOt = () => {
    let states = books.oldTestament();
    for( let i=0; i < states.length; i++) {
      state[states[i]][0] = true;
      state[states[i]][1] = false;
      let name = states[i];
      let b: boolean[] = [];
      b[0] = true;
      b[1] = false;  
      setState({ ...state, [name]: b });
    }
  };

  const handleSelectNoneNt = () => {
    let states = books.newTestament();
    for( let i=0; i < states.length; i++) {
      state[states[i]][0] = false;
      state[states[i]][1] = false;
      let name = states[i];
      let b: boolean[] = [];
      b[0] = false;
      b[1] = false;  
      setState({ ...state, [name]: b });
    }
  };

  const handleSelectAllNt = () => {
    let states = books.newTestament();
    for( let i=0; i < states.length; i++) {
      state[states[i]][0] = true;
      state[states[i]][1] = false;
      let name = states[i];
      let b: boolean[] = [];
      b[0] = true;
      b[1] = false;  
      setState({ ...state, [name]: b });
    }
  };

  /* ----------------------------------------------------------
      Switch for data refresh
  */
 const [clearF, setClearF] = React.useState({
    clearFlag: false,
  });

  const handleChangeClearFlag = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setClearF({ ...clearF, [name]: event.target.checked });
  };


  
  /* ----------------------------------------------------------
      Form/checkbox stuff 
  */
  // these are for the initial book seletion
  const handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let b: boolean[] = [];
    b[0] = event.target.checked;
    b[1] = false;
    setState({ ...state, [name]: b });
  };

  const handleFinishedChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let b: boolean[] = [];
    b[0] = true;
    b[1] = event.target.checked;
    setState({ ...state, [name]: b });
  };

  const [_opt, setOpt] = React.useState(<CircularProgress/>);
  React.useEffect( () => {
    const fetchData = async () => {
      try {
        await opt.optimize(state, setOpt);
      } catch (error) {
        setOpt(
          <div>
            {error.message}
          </div>
        )
        return;
      }
    };
    if (activeStep !== 3) {return;}
    fetchData();
  }, [state,activeStep]); 
  // the parameter [] allows the effect to skip if value unchanged
  // an empty [] will only update on mount of component
  

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" 
          className={clsx(classes.appBar, {[classes.appBarShift]: open })}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Book Package and Flow Optimization
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <FormGroup row>
            <FormControlLabel
              control={
                <Switch checked={clearF.clearFlag} onChange={handleChangeClearFlag('clearFlag')} value="clearFlag" color="primary" />
              }
              label="Refresh Book Package Data"
            />
        </FormGroup>
        <Divider />
              <Button disabled={activeStep !== 0 } onClick={handleDeleteLocalCache} color="primary" variant="contained" className={classes.button}>
              Delete Local Cache
              </Button>
              <Divider />
              <Button disabled={activeStep !==1 }   onClick={handleExportDetails} color="primary" variant="contained" className={classes.button}>
              Export Snapshot
              </Button>
              <Divider />
              <Button disabled={activeStep === 0 } aria-describedby={id}  
                onClick={handlePermalink} color="primary" variant="contained" className={classes.button}
              >
              Copy Link
              </Button>
              <Popover
                id={id}
                open={popen}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <Typography>Link copied to clipboard!</Typography>
              </Popover>
      </Drawer> 
      <Paper>
        <Typography> <br/> <br/> </Typography>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: { optional?: React.ReactNode } = {};
            if (isStepOptional(index)) {
              labelProps.optional = <Typography variant="caption">Optional</Typography>;
            }
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <Container>
          <div className={classes.alignItemsAndJustifyContent}>
          <Typography className={classes.instructions}>{getStepContent(activeStep)}</Typography>
          </div>

          <div className={classes.alignItemsAndJustifyContent}>
            <Button disabled={activeStep === 0} onClick={handleBack} color="primary" variant="contained" className={classes.button}>
              Back
            </Button>

            {isStepOptional(activeStep) && (
              <Button variant="contained" color="primary" onClick={handleSkip} className={classes.button}>
                Skip
              </Button>
            )}

            <Button disabled={activeStep === 3} variant="contained" color="primary" onClick={handleNext} className={classes.button}>
              Next
            </Button>

            {activeStep === 1 && (
              <Button onClick={handleExportSummary} color="primary" variant="contained" className={classes.button}>
              Export
              </Button>
            )}

            {activeStep === 3 && (
              <>
              <Button onClick={handleReset} color="primary" variant="contained" className={classes.button}>
              Start Over
              </Button>
              <Button onClick={handleOptExportSummary} color="primary" variant="contained" className={classes.button}>
              Export Optimization
              </Button>
              </>
            )}
          </div>

          <div className={classes.alignItemsAndJustifyContent}>
            {(activeStep === 0) && (
              <Grid container spacing={3}>
                <Grid item xs={5}>
                  <Paper>
                    <Typography> <br/> </Typography>
                    <div>
                    <Button onClick={handleSelectAllOt} color="primary" variant="contained" className={classes.button}>
                      Select All
                    </Button>
                    <Button onClick={handleSelectNoneOt} color="primary" variant="contained" className={classes.button}>
                      Select None
                    </Button>
                    </div>
                    <FormControl required component="fieldset" className={classes.formControl}>
                    <FormLabel component="legend">Old Testament</FormLabel>
                    <FormGroup>
                      {books.oldTestament().map(t => 
                        <FormControlLabel
                          control={<Checkbox checked={state[t][0]} onChange={handleChange(t)} value={t} />}
                          label={t} key={t}
                        />
                      )}                
                    </FormGroup>
                    <FormHelperText />
                    </FormControl>
                  </Paper>
                </Grid>
                <Grid item xs={2}>
                <Typography> <br/> <br/> <br/> </Typography>
                  <Paper>
                  <FormControl required component="fieldset" className={classes.formControl}>
                    <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox checked={state['Open Bible Stories'][0]} 
                              onChange={handleChange('Open Bible Stories')} 
                              value='Open Bible Stories' />
                          }
                          label='Open Bible Stories' key='Open Bible Stories'
                        />
                    </FormGroup>
                    <FormHelperText />
                    </FormControl>
                  </Paper>
                </Grid>
                <Grid item xs={5}>
                  <Paper>
                    <Typography> <br/> </Typography>
                    <div>
                    <Button onClick={handleSelectAllNt} color="primary" variant="contained" className={classes.button}>
                      Select All
                    </Button>
                    <Button onClick={handleSelectNoneNt} color="primary" variant="contained" className={classes.button}>
                      Select None
                    </Button>
                    </div>

                    <FormControl required component="fieldset" className={classes.formControl}>
                    <FormLabel component="legend">New Testament</FormLabel>
                    <FormGroup>
                      {books.newTestament().map(t => 
                        <FormControlLabel
                          control={<Checkbox checked={state[t][0]} onChange={handleChange(t)} value={t} />}
                          label={t} key={t}
                        />
                      )}                
                    </FormGroup>
                    <FormHelperText />
                    </FormControl>
                  </Paper>
                </Grid>
              </Grid>
            )}


            {(activeStep === 1) && (
              <div>
                <Paper>
                  <BookPackageRollup bookId={joinBookIds(state)} chapter='' clearFlag={clearF.clearFlag} />
                </Paper>
              </div>
            )}


            {(activeStep === 2 ) && (
              <Paper>
                <FormControl required component="fieldset" className={classes.formControl}>
                <FormLabel component="legend">Select one or more</FormLabel>
                <FormGroup>
                  <div>
                    {Object.keys(state)
                      .filter(function(book) {
                        return state[book][0];
                      }).map(t => (
                        <FormControlLabel
                        control={<GreenCheckbox checked={state[t][1]} onChange={handleFinishedChange(t)} value={t} key={t} />}
                        label={t}
                      />
                    ))}
                  </div>                
                </FormGroup>
                <FormHelperText />
                </FormControl>
              </Paper>
            )}

            {(activeStep === 3) && (
              <Paper>
                {_opt}
              </Paper>
            )}
          </div>
        </Container>
      </Paper>
    </div>
  );
}

/*
http://localhost:3000/book-package-app/?books=mat,mrk,luk,jhn,act,rom,1co,2co,gal,eph,php,col,1th,2th,1ti,2ti,tit,phm,heb,jas,1pe,2pe,1jn,2jn,3jn,jud,rev




*/
