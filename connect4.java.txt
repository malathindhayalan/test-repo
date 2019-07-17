/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package il.ac.bgu.cs.bp.bpjs.connect4;

import il.ac.bgu.cs.bp.bpjs.execution.BProgramRunner;
import il.ac.bgu.cs.bp.bpjs.execution.listeners.PrintBProgramRunnerListener;
import il.ac.bgu.cs.bp.bpjs.model.BProgram;
import il.ac.bgu.cs.bp.bpjs.model.ResourceBProgram;
import il.ac.bgu.cs.bp.bpjs.model.eventselection.PrioritizedBSyncEventSelectionStrategy;

/**
 *
 * @author Malathi
 */


public class connect4 {
    
    public static void main(String[] args) throws InterruptedException {
        // This will load the program file  <Project>/src/main/resources/HelloBPjsWorld.js
        //final BProgram bprog = new ResourceBProgram("new.js");
        
         final BProgram bprog = new ResourceBProgram("connect4.js");
         bprog.setEventSelectionStrategy(new PrioritizedBSyncEventSelectionStrategy());
        BProgramRunner rnr = new BProgramRunner(bprog);

        // Print program events to the console
        rnr.addListener( new PrintBProgramRunnerListener() );
        
        // go!
        rnr.run();
    }
    
}
