import React from 'react';
import { withStyles, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';

import Switch from '@material-ui/core/Switch';

import { green } from '@material-ui/core/colors';
import {BookPackageRollup} from 'book-package-rcl';
import * as books from '../src/core/books';
import * as opt from '../src/core/optimize';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
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
  return ['Select Books', 'Book Package Results', 'Optimized Flow'];
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return 'Select books, then click Next to generate book package results';
    case 1:
      return 'Select any books completed, then click Next to optimize book package flow';
    case 2:
      return 'Finished';
    default:
      return 'Unknown step';
  }
}



export default function HorizontalLinearStepper() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  const steps = getSteps();

  const isStepOptional = (step: number) => {
    return false;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
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
  };

  /* Switch stuff */
  const [clearF, setClearF] = React.useState({
    clearFlag: false,
  });

  const handleChangeClearFlag = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setClearF({ ...clearF, [name]: event.target.checked });
  };


  /* Form/checkbox stuff */

  // these are for the initial book seletion
  const [state, setState] = React.useState({ ...books.titlesToBoolean() }); 
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

  const [_opt, setOpt] = React.useState(<div>Waiting-Optimize</div>);
  React.useEffect( () => {
    const fetchData = async () => {
      let result;
      try {
        result = await opt.optimize(state);
        setOpt(result);  
      } catch (error) {
        setOpt(
          <div>
            {error.message}
          </div>
        )
        return;
      }
    };
    if (activeStep !== 2) {return;}
    fetchData();
  }, [state,activeStep]); 
  // the parameter [] allows the effect to skip if value unchanged
  // an empty [] will only update on mount of component
  


  return (
    <div className={classes.root}>
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
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              Optimized Book Package Flow
            </Typography>
            <Button onClick={handleReset} className={classes.button}>
              Reset
            </Button>
          </div>
        ) : (
          <div>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Switch checked={clearF.clearFlag} onChange={handleChangeClearFlag('clearFlag')} value="clearFlag" color="primary" />
                }
                label="Refresh Book Package Data"
              />
            </FormGroup>
            <Typography className={classes.instructions}>{getStepContent(activeStep)}</Typography>
            {(activeStep === 1 ) && (
                <div>
                  <FormControl required component="fieldset" className={classes.formControl}>
                  <FormLabel component="legend">Select one or more</FormLabel>
                  <FormGroup>
                    <div>
                      {Object.keys(state)
                        .filter(function(book) {
                          return state[book][0];
                        }).map(t => (
                          <FormControlLabel
                          control={<GreenCheckbox checked={state[t][1]} onChange={handleFinishedChange(t)} value={t} />}
                          label={t}
                        />
                      ))}
                    </div>                
                  </FormGroup>
                  <FormHelperText />
                  </FormControl>
                </div>
              )}
            <div>
              <Button disabled={activeStep === 0} onClick={handleBack} color="primary" className={classes.button}>
                Back
              </Button>
              {isStepOptional(activeStep) && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSkip}
                  className={classes.button}
                >
                  Skip
                </Button>
              )}

              {activeStep < 2 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  className={classes.button}
                >
                  Next
                </Button>
              )}

              {activeStep === 2 && (
                <Button onClick={handleReset} color="primary" className={classes.button}>
                Reset
                </Button>
              )}



              {(activeStep === 0) && (
                <FormControl required component="fieldset" className={classes.formControl}>
                <FormLabel component="legend">Select one or more</FormLabel>
                <FormGroup>
                  {books.bookDataTitles().map(t => 
                    <FormControlLabel
                      control={<Checkbox checked={state[t][0]} onChange={handleChange(t)} value={t} />}
                      label={t} key={t}
                    />
                  )}                
                </FormGroup>
                <FormHelperText />
                </FormControl>
              )}


              {(activeStep === 1) && (
                <div>
                  <Paper>
                    <BookPackageRollup bookId={joinBookIds(state)} chapter='' clearFlag={clearF.clearFlag} />
                  </Paper>
                </div>
              )}


              {(activeStep === 2) && (
                <div>
                  {_opt}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


